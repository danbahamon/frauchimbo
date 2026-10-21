import type { DomainId } from '../lib/types'

export function SkillDemo({ domain }: { domain: DomainId }) {
  if (domain === 'NF') {
    return (
      <div className="demo" aria-hidden="true">
        <div className="demo-frac"><i /><i /><i /><i /></div>
        <div className="demo-frac soft"><i /><i /><b /></div>
      </div>
    )
  }
  if (domain === 'MD') {
    return (
      <div className="demo bars" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
    )
  }
  if (domain === 'G') {
    return (
      <div className="demo plane" aria-hidden="true">
        <span />
        <b />
      </div>
    )
  }
  if (domain === 'RP') {
    return (
      <div className="demo ratio-demo" aria-hidden="true">
        <i /><i /><i /><b /><b />
      </div>
    )
  }
  if (domain === 'NBT') {
    return (
      <div className="demo nums" aria-hidden="true">
        <b>2</b><b>4</b><b>0</b>
      </div>
    )
  }
  if (domain === 'NS') {
    return (
      <div className="demo nums" aria-hidden="true">
        <b className="pop-num">−4</b>
      </div>
    )
  }
  if (domain === 'EE') {
    return (
      <div className="demo nums" aria-hidden="true">
        <b>2</b><span>(</span><b>x</b><span>+</span><b>1</b><span>)</span>
      </div>
    )
  }
  if (domain === 'SP') {
    return (
      <div className="demo dots" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
    )
  }
  return (
    <div className="demo nums" aria-hidden="true">
      <b>3</b>
      <span>×</span>
      <b>4</b>
      <span>=</span>
      <b className="pop-num">12</b>
    </div>
  )
}
