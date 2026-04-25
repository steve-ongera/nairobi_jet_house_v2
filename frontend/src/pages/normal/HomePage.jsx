import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'

export default function HomePage() {
  return (
    <>
      <PublicNavbar />
      <div style={{padding: '2rem'}}>
        <h1>Luxury Private Charter Platform</h1>
        <p>Book jets, yachts, and more.</p>
      </div>
      <PublicFooter />
    </>
  )
}
