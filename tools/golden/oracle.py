# Independent oracle (Python, bisection) — NOT the app's code.
# Recovered from the Day 1 planning chat (19 Sep 2026), where it produced
# GOLDEN-CASES.md G1–G7. Includes the one edit made that day: G7 penalty
# changed from 2000 to 2900. Output format may differ from the current
# GOLDEN-CASES.md table; reconcile values, don't assume they match.
#
# THE ONE DOCUMENTED EXCEPTION to "rules.ts is the only place legal constants live"
# (RULES.md; DECISIONS N28). The caps written out below (EIR 0.12, nominal 0.06, total
# cost 1) are this oracle's own copy, on purpose: it shares nothing with the app, so one
# wrong cap cannot pass both sides. tools/golden/check.py, run by CI, keeps them equal to
# rules.ts CEILINGS and keeps this script's output equal to GOLDEN-CASES.md.
def irr_daily(flows):
    f=lambda r: sum(a/(1+r)**d for d,a in flows)
    lo,hi=-0.5,5.0
    for _ in range(300):
        m=(lo+hi)/2
        (lo,hi)=(m,hi) if f(lo)*f(m)>0 else (lo,m)
    return (lo+hi)/2
cases=[
 # id, desc, principal, fee_deducted, payment, n, interval, first_due, penalty
 ("G1","₱5,000 · 30 araw · isang bayad ₱5,300 · walang fee",5000,0,5300,1,30,30,0),
 ("G2","₱5,000 · 7 araw · isang bayad ₱6,500",5000,0,6500,1,7,7,0),
 ("G3","₱5,000 · ₱65 fee binawas · 7 araw · ₱5,070",5000,65,5070,1,7,7,0),
 ("G4","₱5,000 · ₱800 fee binawas · 7 araw · ₱5,500",5000,800,5500,1,7,7,0),
 ("G5","₱3,000 · ₱450 fee binawas · 14 araw · ₱3,000",3000,450,3000,1,14,14,0),
 ("G6","₱10,000 · 4 lingguhang hulog na ₱2,560",10000,0,2560,4,7,7,0),
 ("G7","₱3,000 · 30 araw · ₱3,150 + ₱2,900 penalty",3000,0,3150,1,30,30,2900),
]
print("| ID | Loan | Daily EIR | ×30 (simple) | Compounded | Nominal/mo | Total cost | Verdict |")
print("|---|---|---|---|---|---|---|---|")
for cid,desc,P,fee,pay,n,iv,first,pen in cases:
    net=P-fee; sched=[(first+i*iv,-pay) for i in range(n)]
    d=irr_daily([(0,net)]+sched); simple=d*30; comp=(1+d)**30-1
    tenor=sched[-1][0]; nominal=(pay*n-P)/P/(tenor/30)
    cost=(pay*n+pen+fee-P)/P
    if comp<=0.12: e="within"
    elif simple>0.12: e="OVER"
    else: e="GRAY"
    flags=[]
    if nominal>0.06+1e-9: flags.append("NIR over")
    flags.append("EIR "+e)
    if cost>1+1e-9: flags.append("total-cost OVER")
    print(f"| {cid} | {desc} | {d*100:.4f}% | {simple*100:.2f}% | {comp*100:.2f}% | {nominal*100:.2f}% | {cost*100:.1f}% | {', '.join(flags)} |")
