export default function Decor() {
  return (
    <>
      <div className="aura a" aria-hidden="true"></div>
      <div className="aura b" aria-hidden="true"></div>
      <canvas id="gl" aria-hidden="true"></canvas>
      <div className="vignette" aria-hidden="true"></div>
      <div className="grain" aria-hidden="true"></div>
      <i className="comet" style={{ top: '16%' }} aria-hidden="true"></i>
      <i className="comet c2" aria-hidden="true"></i>
      <div className="hud" aria-hidden="true"><b></b><span id="hudTxt">FIELD · SPHERE · 16K PTS</span></div>
      <div className="progress" aria-hidden="true"><i id="pbar"></i></div>
      <div className="cur" aria-hidden="true"></div>
    </>
  )
}
