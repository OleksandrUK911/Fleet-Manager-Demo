import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__inner">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">Page not found</h1>
        <p className="notfound__desc">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a href="/" className="btn btn-primary btn--lg" style={{ marginTop: '2rem' }}>
          ← Back to home
        </a>
      </div>
    </div>
  )
}
