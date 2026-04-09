export default function About() {
  return (
    <section className="py-16">
  <h1 className="text-4xl font-bold text-white mb-4">
    About LuxeDrive 🚗
  </h1>
  <p className="text-gray-400 max-w-2xl">
    LuxeDrive is a modern car rental platform built for convenience,
    affordability, and premium driving experience.
  </p>
  <section className="grid md:grid-cols-3 gap-6 py-12">
  {[
    { title: "Affordable Prices", desc: "Budget-friendly cars for everyone" },
    { title: "Easy Booking", desc: "Book in just a few clicks" },
    { title: "Trusted Service", desc: "Verified cars & secure payments" },
  ].map((item, i) => (
    <div key={i} className="card-dark p-6 rounded-xl">
      <h3 className="text-white font-semibold mb-2">{item.title}</h3>
      <p className="text-gray-400 text-sm">{item.desc}</p>
    </div>
  ))}
</section>
<section className="py-12 grid grid-cols-3 text-center">
  <div>
    <h2 className="text-2xl text-gold-400 font-bold">500+</h2>
    <p className="text-gray-400 text-sm">Cars Available</p>
  </div>
  <div>
    <h2 className="text-2xl text-gold-400 font-bold">1000+</h2>
    <p className="text-gray-400 text-sm">Happy Customers</p>
  </div>
  <div>
    <h2 className="text-2xl text-gold-400 font-bold">20+</h2>
    <p className="text-gray-400 text-sm">Cities Covered</p>
  </div>
</section>
</section>


  )
}