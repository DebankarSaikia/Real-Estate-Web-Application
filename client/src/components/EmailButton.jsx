import { useEffect, useState } from 'react';

export default function EmailButton({ userRef, listingName }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function fetchEmail() {
      try {
        const res = await fetch(`/api/user/${userRef}`);
        const data = await res.json();
        setEmail(data.email);
      } catch (e) {
        setEmail('');
      }
    }
    if (userRef) fetchEmail();
  }, [userRef]);

  if (!email) return null;

  const subject = encodeURIComponent(`Inquiry about your listing: ${listingName}`);
  const body = encodeURIComponent('Hi, I am interested in your property listed on Zephyr. Please provide more details.');

  return (
    <a
      href={`mailto:${email}?subject=${subject}&body=${body}`}
      className='bg-blue-600 text-white rounded-lg uppercase hover:opacity-95 p-3 flex-1 text-center'
      style={{ textDecoration: 'none' }}
      target="_blank" rel="noopener noreferrer"
    >
      Contact landlord (Mail)
    </a>
  );
}
