export default function Contact() {
  return (
    <section id="contact" data-shape="3" data-num="04">
      <div className="label">04 — Contact</div>
      <h2>
        <span className="row"><span>Have an idea?</span></span>
        <span className="row"><span><em>Let's give it form.</em></span></span>
      </h2>
      <a className="mail" id="mailbtn" href="mailto:mohsinrafiq931@gmail.com"><span>mohsinrafiq931@gmail.com</span><span>↗</span></a>
      <div className="socials-row">
        <a href="https://github.com/mohsinRafiq-dev" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/muhammad-mohsin-rafiq-94060333a/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://www.instagram.com/_asadmughal/" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://x.com/_asadmughal" target="_blank" rel="noopener noreferrer">X / Twitter</a>
        {/* EDIT: drop your resume PDF into public/resume.pdf to enable this link */}
        <a href="/resume.pdf" download>Resume ↓</a>
      </div>
    </section>
  )
}
