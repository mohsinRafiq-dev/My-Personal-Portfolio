import projects from '../data/projects'

export default function Work() {
  return (
    <section id="work" data-shape="2" data-num="02">
      <div className="label">02 — Selected work</div>
      <h2 className="sec-title"><span className="lw"><span>Built &</span></span> <em className="lw"><span>shipped</span></em></h2>
      <div className="bento">
        {projects.map((p, i) => (
          <a key={i} className={`pcard rv${p.wide ? ' wide' : ''}`} href={p.href} target="_blank" rel="noopener noreferrer">
            <div className="art"><img className="grad shot" src={p.image} alt={`${p.title} screenshot`} loading="lazy" /></div><div className="glare"></div>
            <span className="num">{p.num}</span><span className="year">{p.tag}</span>
            <div className="body">
              <h3>{p.title} <svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8" /></svg></h3>
              <p>{p.copy}</p>
              <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
            </div>
          </a>
        ))}
      </div>
      <div className="more-work rv">
        <a className="btn" href="https://github.com/mohsinRafiq-dev" target="_blank" rel="noopener noreferrer"><span>View full archive ↗</span></a>
      </div>
    </section>
  )
}
