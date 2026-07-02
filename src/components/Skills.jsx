import { Fragment } from 'react'

const row1 = [
  { t: 'React.js', sol: true }, { t: 'Next.js' }, { t: 'TypeScript', sol: true },
  { t: 'Node.js' }, { t: 'Express.js', sol: true }, { t: 'MongoDB' },
]
const row2 = [
  { t: 'TailwindCSS' }, { t: 'PostgreSQL', sol: true }, { t: 'Docker' },
  { t: 'AWS', sol: true }, { t: 'Git & GitHub' }, { t: 'Firebase', sol: true },
]

const services = [
  { n: 'S.01', h: 'Performance', p: 'Optimizing for lightning-fast speed.' },
  { n: 'S.02', h: 'Design', p: 'Creating beautiful, responsive user interfaces.' },
  { n: 'S.03', h: 'Clean Code', p: 'Writing maintainable, well-architected code.' },
  { n: 'S.04', h: 'Innovation', p: 'Always exploring new technologies.' },
]

function Marquee({ dir, words }) {
  return (
    <div className="skill-marquee" data-dir={dir}>
      <div className="strk">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className={w.sol ? 'sol' : undefined}>{w.t}</span>
            <span className="dotd">×</span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" data-shape="2" data-num="03">
      <div className="label">03 — Arsenal</div>
      <h2 className="sec-title"><span className="lw"><span>The</span></span> <em className="lw"><span>stack</span></em></h2>
      <Marquee dir="1" words={row1} />
      <Marquee dir="-1" words={row2} />
      <div className="services">
        {services.map(s => (
          <div key={s.n} className="svc rv"><div className="n">{s.n}</div><h4>{s.h}</h4><p>{s.p}</p></div>
        ))}
      </div>
    </section>
  )
}
