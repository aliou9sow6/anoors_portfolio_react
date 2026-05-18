import { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [envoye, setEnvoye] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnvoye(true);
    setForm({ nom: '', email: '', message: '' });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-card border border-[var(--border)] rounded-2xl shadow-card p-8">
        <h1 className="text-3xl font-bold text-primary font-syne mb-4 text-center">
          Contactez-nous
        </h1>
        <p className="text-secondary text-center mb-8 font-dm-sans">
          Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
        </p>

        {envoye && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center font-dm-sans">
            ✅ Message envoyé avec succès !
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-primary mb-1 font-dm-sans">
              Nom complet
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={form.nom}
              onChange={handleChange}
              placeholder="Jean Dupont"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary font-dm-sans transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-1 font-dm-sans">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="jean@exemple.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary font-dm-sans transition"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-primary mb-1 font-dm-sans">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={form.message}
              onChange={handleChange}
              placeholder="Votre message ici..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-primary font-dm-sans transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-accent hover:bg-accent-light text-white font-semibold font-dm-sans transition-colors duration-200"
          >
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
