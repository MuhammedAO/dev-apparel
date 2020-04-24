import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <h1>Welcome</h1>
      <Link href="/sell">
      <a>Sell</a>
      </Link>
    </div>
  )
}

export default Home;
