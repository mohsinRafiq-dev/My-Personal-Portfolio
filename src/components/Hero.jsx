export default function Hero() {
  return (
    <section id="hero" data-shape="0">
      <div className="hero-top">
        <span className="ok">Available for work</span>
        <span>Based in Islamabad / Remote worldwide</span>
        <span>EST. 2023</span>
      </div>
      <h1 aria-label="I turn chaos into structure">
        <span className="row"><span>I turn</span></span>
        <span className="row"><span className="serif">chaos</span>&nbsp;<span className="out">into</span></span>
        <span className="row"><span>Structure</span></span>
      </h1>
      <div className="hero-bottom">
        <p><b>Mohsin Rafiq — Full Stack Developer specializing in the MERN stack.</b> I build scalable, high-performance web applications with clean architecture and smooth user experiences. Every particle on this page is raw data finding its form.</p>
        <div className="cue-wrap">
          <div className="orbit" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs><path id="orb" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text><textPath href="#orb">FULL STACK DEVELOPER · MOHSIN RAFIQ · FULL STACK DEVELOPER · MOHSIN RAFIQ · </textPath></text>
            </svg>
            <em>↓</em>
          </div>
          <div className="hero-cue"><i></i> Scroll — watch the field reshape</div>
        </div>
      </div>
    </section>
  )
}
