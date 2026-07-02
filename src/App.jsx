import Decor from './components/Decor'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Dock from './components/Dock'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import About from './components/About'
import Work from './components/Work'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'
import useSignalField from './hooks/useSignalField'

function App() {
  useSignalField()

  return (
    <>
      <Decor />
      <Loader />
      <Nav />
      <Dock />

      <main>
        <Hero />
        <Ticker />
        <About />
        <Work />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

export default App
