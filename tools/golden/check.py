"""CI drift check for the independent oracle (DECISIONS N27, N28).

1. Runs tools/golden/oracle.py and compares every value it prints with the G1-G7
   table in GOLDEN-CASES.md, cell by cell (the tables are compared by value, not diffed).
2. Compares the caps the oracle writes out itself with CEILINGS in src/lib/rules.ts.
   The oracle keeps its own copy on purpose (RULES.md: the one exception); this is the
   check that keeps the two copies in agreement. Only this checker reads both.

Exits 1 on any difference. Standard library only; run from anywhere:
    python tools/golden/check.py
"""
import ast
import contextlib
import io
import json
import re
import runpy
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ORACLE = ROOT / "tools" / "golden" / "oracle.py"
GOLDEN = ROOT / "GOLDEN-CASES.md"
ROW = re.compile(r"^\|\s*(G\d+)\s*\|(.*)\|\s*$")
COLUMNS = ["Loan", "Daily EIR", "x30 (simple)", "Compounded", "Nominal/mo", "Total cost", "Verdict"]

sys.stdout.reconfigure(encoding="utf-8")
problems = []


def rows(text, where):
    found = {}
    for number, line in enumerate(text.splitlines(), 1):
        m = ROW.match(line)
        if not m:
            continue
        if m.group(1) in found:
            problems.append(f"{where}: {m.group(1)} appears twice (again at line {number})")
        found[m.group(1)] = [cell.strip() for cell in m.group(2).split("|")]
    return found


# 1. Values: the oracle's table against GOLDEN-CASES.md.
out = io.StringIO()
with contextlib.redirect_stdout(out):
    runpy.run_path(str(ORACLE), run_name="__main__")
oracle = rows(out.getvalue(), "oracle.py output")
golden = rows(GOLDEN.read_text(encoding="utf-8"), "GOLDEN-CASES.md")

if list(oracle) != list(golden):
    problems.append(f"case ids differ: oracle.py {list(oracle)} vs GOLDEN-CASES.md {list(golden)}")
cells = 0
for case in golden:
    if case not in oracle:
        continue
    o, g = oracle[case], golden[case]
    if len(o) != len(COLUMNS) or len(g) != len(COLUMNS):
        problems.append(f"{case}: expected {len(COLUMNS)} cells, oracle has {len(o)}, table has {len(g)}")
        continue
    for column, a, b in zip(COLUMNS, o, g):
        cells += 1
        if a != b:
            problems.append(f"{case} {column}: oracle.py prints {a!r}, GOLDEN-CASES.md has {b!r}")

# 2. Caps: the literals in the oracle's comparisons against rules.ts.
def number(node):
    """0.12, or 0.06+1e-9 (a cap plus the float tolerance), as the cap."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        return number(node.left)
    return None


# Which rules.ts ceiling each oracle variable is compared against.
CAP_OF = {"comp": "effectivePerMonth", "simple": "effectivePerMonth", "nominal": "nominalPerMonth", "cost": "totalCostRatio"}
oracle_caps = {}
for node in ast.walk(ast.parse(ORACLE.read_text(encoding="utf-8"))):
    if isinstance(node, ast.Compare) and isinstance(node.left, ast.Name) and node.left.id in CAP_OF:
        value = number(node.comparators[0])
        if value is not None:
            oracle_caps.setdefault(node.left.id, []).append(value)

rules_js = (
    'import("./src/lib/rules.ts").then((r) => console.log(JSON.stringify(r.CEILINGS)))'
)
ceilings = json.loads(
    subprocess.run(
        ["node", "--experimental-strip-types", "--input-type=module", "-e", rules_js],
        cwd=ROOT, capture_output=True, text=True, encoding="utf-8", check=True,
    ).stdout
)
for variable, key in CAP_OF.items():
    found = oracle_caps.get(variable, [])
    if not found:
        problems.append(f"oracle.py: no cap found for {variable} (compared against rules.ts {key})")
    for value in found:
        if value != float(ceilings[key]):
            problems.append(f"oracle.py compares {variable} with {value}, rules.ts CEILINGS.{key} is {ceilings[key]}")

if problems:
    print("Oracle drift check FAILED:\n- " + "\n- ".join(problems))
    sys.exit(1)
print(
    f"Oracle drift check passed: {cells} cells of G1-G7 match GOLDEN-CASES.md; "
    f"the oracle's caps match rules.ts CEILINGS ({', '.join(sorted(set(CAP_OF.values())))})."
)
