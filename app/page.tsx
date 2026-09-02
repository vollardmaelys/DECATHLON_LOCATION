'use client';

import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Equipment = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: string;
  dayPrice: string;
  detail: string;
  tag?: string;
};

type RentalDuration = 'half-day' | 'day';

const equipment: Equipment[] = [
  { id: 'kayak-duo', name: 'Kayak duo', category: 'Nautisme', image: '/images/kayak.png', price: '3 500 F', dayPrice: '6 000 F', detail: '2 places · gilets inclus', tag: 'Le plus loué' },
  { id: 'paddle-11', name: 'Paddle 11′', category: 'Nautisme', image: '/images/paddle.png', price: '3 000 F', dayPrice: '5 000 F', detail: 'Stable · gonflable', tag: 'Lagoon ready' },
  { id: 'surf-mousse', name: 'Planche de surf', category: 'Glisse', image: '/images/surf.png', price: '3 000 F', dayPrice: '5 000 F', detail: 'Mousse 8′ · leash inclus' },
  { id: 'tennis-racket', name: 'Raquette de tennis', category: 'Raquettes', image: '/images/tennis.png', price: '1 500 F', dayPrice: '2 500 F', detail: 'Raquette & 3 balles' },
  { id: 'padel-racket', name: 'Raquette de padel', category: 'Raquettes', image: '/images/padel.png', price: '1 500 F', dayPrice: '2 500 F', detail: 'Niveau débutant à confirmé' },
  { id: 'beach-tennis', name: 'Raquette de beach tennis', category: 'Raquettes', image: '/images/beach-tennis.png', price: '1 500 F', dayPrice: '2 500 F', detail: 'Légère · prête à jouer' },
];

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const rentalDurations: { id: RentalDuration; label: string; detail: string }[] = [
  { id: 'half-day', label: 'Demi-journée', detail: 'Matin ou après-midi' },
  { id: 'day', label: 'Journée', detail: 'Jusqu’à la fermeture' },
];

function dateInDays(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function prettyDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
}

export default function Home() {
  const [selectedId, setSelectedId] = useState('kayak-duo');
  const [selectedDate, setSelectedDate] = useState(() => dateInDays(1));
  const [selectedDuration, setSelectedDuration] = useState<RentalDuration>('half-day');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const selectedEquipment = useMemo(() => equipment.find((item) => item.id === selectedId) ?? equipment[0], [selectedId]);
  const selectedDurationLabel = rentalDurations.find((duration) => duration.id === selectedDuration)?.label ?? 'Demi-journée';
  const displayedPrice = selectedDuration === 'day' ? selectedEquipment.dayPrice : selectedEquipment.price;
  const fullDayUnavailable = selectedDuration === 'day' && bookedSlots.length > 0;
  const availableSlotCount = selectedDuration === 'day'
    ? (fullDayUnavailable ? 0 : 1)
    : timeSlots.filter((time) => !bookedSlots.includes(time)).length;
  const availabilityLabel = isLoadingSlots
    ? 'Mise à jour…'
    : selectedDuration === 'day'
      ? (fullDayUnavailable ? 'Journée indisponible' : 'Journée complète disponible')
      : `${availableSlotCount} créneau${availableSlotCount > 1 ? 'x' : ''} disponible${availableSlotCount > 1 ? 's' : ''}`;

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingSlots(true);
    setSelectedTime(null);
    setNotice('');
    fetch(`/api/bookings?equipmentId=${selectedId}&date=${selectedDate}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Impossible de charger les disponibilités.');
        return response.json() as Promise<{ bookedSlots: string[] }>;
      })
      .then((data) => { if (isCurrent) setBookedSlots(data.bookedSlots); })
      .catch(() => {
        if (isCurrent) {
          setBookedSlots([]);
          setNotice('Les disponibilités sont momentanément indisponibles. Réessaie dans un instant.');
        }
      })
      .finally(() => { if (isCurrent) setIsLoadingSlots(false); });
    return () => { isCurrent = false; };
  }, [selectedId, selectedDate]);

  async function reserveSlot() {
    if (!selectedTime) return setNotice('Choisis d’abord un créneau de retrait.');
    if (!name.trim() || !email.trim()) return setNotice('Indique ton nom et ton adresse e-mail pour confirmer.');
    setIsSubmitting(true);
    setNotice('');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: selectedId, date: selectedDate, time: selectedTime, duration: selectedDuration, name, email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setNotice(data.error ?? 'Ce créneau vient d’être réservé. Choisis-en un autre.');
        if (response.status === 409) {
          setBookedSlots((current) => [...new Set([...current, selectedTime])]);
          setSelectedTime(null);
        }
        return;
      }
      setBookedSlots((current) => [...new Set([...current, selectedTime])]);
      setConfirmation(true);
    } catch {
      setNotice('Un souci est survenu. Vérifie ta connexion puis réessaie.');
    } finally { setIsSubmitting(false); }
  }

  function chooseEquipment(id: string) {
    setSelectedId(id);
    setConfirmation(false);
    document.querySelector('#reserver')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="Decathlon Tahiti Location, accueil"><span>DECATHLON</span><small>TAHITI · LOCATION</small></a>
        <nav aria-label="Navigation principale"><a href="#equipements">Équipements</a><a href="#comment">Comment ça marche</a><a href="#magasin">Le magasin</a></nav>
        <a className="header-cta" href="#reserver">Réserver <ChevronRight aria-hidden="true" /></a>
      </header>

      <section id="accueil" className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles aria-hidden="true" /> Tout le matériel, sans contrainte</p>
          <h1>La location qui libère <em>tes envies de sport.</em></h1>
          <p className="hero-text">Kayak, paddle, surf ou raquette : choisis ton terrain de jeu et réserve ton matériel pour la demi-journée ou la journée.</p>
          <div className="hero-actions"><a className="button button-primary" href="#reserver">Trouver mon créneau <ChevronRight aria-hidden="true" /></a><a className="text-link" href="#equipements">Voir les équipements</a></div>
          <div className="hero-notes" aria-label="Les avantages de la location"><span><Check aria-hidden="true" /> Matériel vérifié</span><span><Check aria-hidden="true" /> Retrait rapide</span><span><Check aria-hidden="true" /> Paiement en magasin</span></div>
        </div>
        <div className="hero-image-wrap"><img src="/images/tahiti-home-banner.png" alt="Visuel officiel Decathlon Tahiti" className="hero-image" /><div className="hero-sticker"><Waves aria-hidden="true" /><span>Prêt pour<br />le lagon</span></div></div>
      </section>

      <section id="equipements" className="section-shell equipment-section">
        <div className="section-heading"><div><p className="eyebrow">À toi de jouer</p><h2>Choisis ton terrain de jeu.</h2></div><p>Des essentiels solides, entretenus et sélectionnés pour profiter sans réfléchir.</p></div>
        <div className="equipment-grid">
          {equipment.map((item) => (
            <article className={`equipment-card ${selectedId === item.id ? 'selected' : ''}`} key={item.id}>
              <div className="equipment-visual">{item.tag && <span className="equipment-tag">{item.tag}</span>}<img src={item.image} alt={item.name} className="product-image" /><span className="visual-label">{item.category}</span></div>
              <div className="equipment-content"><p className="equipment-name">{item.name}</p><p className="equipment-detail">{item.detail}</p><div className="equipment-bottom"><div className="equipment-price-list" aria-label={`Tarifs de location pour ${item.name}`}><span><strong>{item.price}</strong><small>Demi-journée</small></span><span><strong>{item.dayPrice}</strong><small>Journée</small></span></div><button type="button" onClick={() => chooseEquipment(item.id)} aria-label={`Louer ${item.name}`}><ChevronRight aria-hidden="true" /></button></div></div>
            </article>
          ))}
        </div>
      </section>

      <section id="reserver" className="booking-section">
        <div className="section-shell booking-layout">
          <div className="booking-intro"><p className="eyebrow">Réservation en ligne</p><h2>Un créneau, et c’est parti.</h2><p>Choisis ton matériel, la date et l’horaire de retrait. Les créneaux déjà réservés se verrouillent automatiquement.</p><div className="booking-tip"><ShieldCheck aria-hidden="true" /> Ton matériel est mis de côté dès la confirmation.</div></div>
          <div className="booking-card" aria-live="polite">
            {confirmation ? (
              <div className="confirmation"><div className="confirmation-icon"><Check aria-hidden="true" /></div><p className="eyebrow">Réservation confirmée</p><h3>Merci pour ta réservation !</h3><p>Tu recevras par mail les informations de ta réservation. Viens en magasin récupérer et payer ta location.</p><div className="confirmation-summary"><span>{selectedEquipment.name} · {selectedDurationLabel}</span><span>{prettyDate(selectedDate)} · {selectedTime}</span></div><button className="button button-secondary" type="button" onClick={() => setConfirmation(false)}>Réserver un autre créneau</button></div>
            ) : (
              <>
                <div className="booking-card-top"><div><span className="booking-step">01</span><h3>Ta location</h3></div><span className="booking-price">{displayedPrice}<small> / {selectedDurationLabel.toLowerCase()}</small></span></div>
                <label className="field-label" htmlFor="equipment">Matériel</label>
                <select id="equipment" className="select-control" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{equipment.map((item) => <option key={item.id} value={item.id}>{item.name} — demi-journée {item.price} · journée {item.dayPrice}</option>)}</select>
                <div className="field-pair"><div><label className="field-label" htmlFor="date">Date de retrait</label><div className="field-with-icon"><CalendarDays aria-hidden="true" /><input id="date" type="date" min={dateInDays(0)} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div></div><div><span className="field-label">Formule et tarif</span><div className="duration-options" role="group" aria-label="Durée de location">{rentalDurations.map((duration) => { const durationPrice = duration.id === 'day' ? selectedEquipment.dayPrice : selectedEquipment.price; return <button key={duration.id} type="button" className={`duration-option ${selectedDuration === duration.id ? 'duration-option-selected' : ''}`} aria-pressed={selectedDuration === duration.id} onClick={() => { setSelectedDuration(duration.id); setSelectedTime(null); }}><Clock3 aria-hidden="true" /><span className="duration-option-copy"><span>{duration.label}</span><small>{duration.detail}</small></span><strong>{durationPrice}</strong></button>; })}</div></div></div>
                <div className="slot-header"><span className="field-label">Heure de retrait</span><small>{availabilityLabel}</small></div>
                <div className="slot-grid">{timeSlots.map((time) => { const unavailable = bookedSlots.includes(time) || fullDayUnavailable; return <button key={time} type="button" className={`slot ${selectedTime === time ? 'slot-selected' : ''}`} disabled={isLoadingSlots || unavailable} onClick={() => setSelectedTime(time)}>{time}<small>{unavailable ? 'Indisponible' : selectedDuration === 'day' ? 'Retrait' : 'Disponible'}</small></button>; })}</div>
                <div className="customer-fields"><div><label className="field-label" htmlFor="name">Ton nom</label><input id="name" className="text-control" value={name} onChange={(event) => setName(event.target.value)} placeholder="Prénom et nom" autoComplete="name" /></div><div><label className="field-label" htmlFor="email">Ton e-mail</label><div className="field-with-icon"><Mail aria-hidden="true" /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="toi@email.com" autoComplete="email" /></div></div></div>
                {notice && <p className="form-notice" role="status">{notice}</p>}
                <button className="button button-primary confirm-button" type="button" onClick={reserveSlot} disabled={isSubmitting || isLoadingSlots}>{isSubmitting ? 'Confirmation…' : 'Valider ma réservation'} <ChevronRight aria-hidden="true" /></button><p className="payment-note">Aucun paiement en ligne. Tu règles ta location lors du retrait.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="comment" className="section-shell steps-section"><div className="section-heading compact-heading"><div><p className="eyebrow">Rien de compliqué</p><h2>Prêt en trois mouvements.</h2></div></div><div className="steps"><article><span>01</span><CalendarDays aria-hidden="true" /><h3>Tu réserves</h3><p>Le matériel, la date et le créneau qui te conviennent.</p></article><article><span>02</span><MapPin aria-hidden="true" /><h3>Tu retires</h3><p>On prépare ton équipement avant ton arrivée au magasin.</p></article><article><span>03</span><Waves aria-hidden="true" /><h3>Tu profites</h3><p>Quelques conseils, le bon matériel, et place à la session.</p></article></div></section>
      <section id="magasin" className="store-section"><div className="section-shell store-layout"><div><p className="eyebrow">Ton point de retrait</p><h2>On se retrouve<br /><em>à Punaauia.</em></h2></div><div className="store-details"><MapPin aria-hidden="true" /><div><strong>Decathlon Tahiti</strong><p>Côté Phenix, Punaauia<br />Lun–ven 8h30–18h · sam 8h–18h · dim 8h–13h</p></div><a href="#reserver" aria-label="Réserver un créneau"><ChevronRight aria-hidden="true" /></a></div></div></section>
      <footer><span>DECATHLON TAHITI · LOCATION</span><span>Le sport, accessible à tous.</span><span>© 2026</span></footer>
    </main>
  );
}
