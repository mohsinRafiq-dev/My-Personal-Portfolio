import { Fragment } from 'react'

const words = ['Design', 'Engineering', 'Motion', '3D', 'Performance']

export default function Ticker() {
  const items = [...words, ...words]
  return (
    <div className="ticker" aria-hidden="true">
      <div className="trk">
        {items.map((w, i) => (
          <Fragment key={i}>
            <span>{w}</span>
            <span><i>×</i></span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
