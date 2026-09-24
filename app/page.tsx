'use client';

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  ExternalLink,
  FileCheck2,
  Mail,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Waves,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { equipment, getEquipment, type Equipment } from '../lib/products';

type RentalDuration = 'half-day' | 'day';

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const rentalDurations: { id: RentalDuration; label: string; detail: string }[] = [
  { id: 'half-day', label: 'Demi-journée', detail: 'Matin ou après-midi' },
  { id: 'day', label: 'Journée', detail: 'Jusqu’à la fermeture' },
];

const faqItems = [
  {
    question: 'Comment fonctionne la location à Tahiti ?',
    answer: 'Tu choisis ton matériel, ta date, ton tarif et ton heure de retrait. Une fois la réservation confirmée, ton matériel est mis de côté à Decathlon Tahiti, à Punaauia.',
  },
  {
    question: 'Est-ce que je paie en ligne ?',
    answer: 'Non. La réservation en ligne est sans paiement. Tu règles ta location directement en magasin au moment du retrait.',
  },
  {
    question: 'Que dois-je apporter lors du retrait ?',
    answer: 'Présente ta confirmation de réservation et une pièce d’identité. Une caution peut être demandée en magasin selon le matériel loué et les conditions appliquées le jour du retrait.',
  },
  {
    question: 'Puis-je modifier ou annuler ma réservation ?',
    answer: 'Oui, contacte le magasin le plus tôt possible afin de libérer le créneau ou de vérifier les alternatives disponibles.',
  },
  {
    question: 'À quelle heure dois-je restituer le matériel ?',
    answer: 'Le retour se fait à l’horaire indiqué sur ton contrat de location et avant la fermeture du magasin : 18 h du lundi au samedi et 13 h le dimanche.',
  },
  {
    question: 'Que se passe-t-il en cas de dommage ?',
    answer: 'Signale tout incident dès que possible. L’état du matériel est vérifié avec l’équipe au retrait et au retour ; les modalités applicables sont celles du contrat signé en magasin.',
  },
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

function productFromPath(pathname: string) {
  const match = pathname.match(/^\/produits\/([^/]+)\/?$/);
  return match ? getEquipment(decodeURIComponent(match[1])) : undefined;
}

function requestedEquipmentId() {
  if (typeof window === 'undefined') return equipment[0].id;
  return getEquipment(new URLSearchParams(window.location.search).get('produit'))?.id ?? equipment[0].id;
}

function SiteHeader({ details = false }: { details?: boolean }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Decathlon Tahiti Location, accueil"><img className="brand-logo" src="/decathlon-logo.svg" alt="Decathlon" /><small>TAHITI · LOCATION</small></a>
      <nav aria-label="Navigation principale">
        <a href="/#equipements">Équipements</a>
        <a href="/#comment">Comment ça marche</a>
        <a href="/#regles">Règles</a>
        <a href="/#faq">FAQ</a>
        <a href="/#magasin">Le magasin</a>
      </nav>
      <a className="header-cta" href={details ? '/#reserver' : '#reserver'}>Réserver <ChevronRight aria-hidden="true" /></a>
    </header>
  );
}

function EquipmentCard({ item }: { item: Equipment }) {
  return (
    <a className="equipment-card" href={`/produits/${item.id}`} aria-label={`Voir la fiche de ${item.name}`}>
      <div className="equipment-visual">
        <span className="equipment-tag">{item.tag}</span>
        <img src={item.image} alt={item.name} className="product-image" />
        <span className="visual-label">{item.category}</span>
      </div>
      <div className="equipment-content">
        <p className="equipment-name">{item.name}</p>
        <p className="equipment-detail">{item.detail}</p>
        <div className="equipment-bottom">
          <div className="equipment-price-list" aria-label={`Tarifs de location pour ${item.name}`}>
            <span><strong>{item.price}</strong><small>Demi-journée</small></span>
            <span><strong>{item.dayPrice}</strong><small>Journée</small></span>
          </div>
          <span className="equipment-detail-link">Détails <ChevronRight aria-hidden="true" /></span>
        </div>
      </div>
    </a>
  );
}

function ProductDetails({ product }: { product: Equipment }) {
  return (
    <main className="product-page">
      <SiteHeader details />
      <section className="section-shell product-breadcrumb">
        <a href="/#equipements"><ArrowLeft aria-hidden="true" /> Retour aux équipements</a>
      </section>
      <section className="section-shell product-layout">
        <div className="product-visual-panel">
          <span className="product-tag">{product.category}</span>
          <img src={product.image} alt={product.name} className="product-detail-image" />
        </div>
        <div className="product-summary">
          <p className="eyebrow"><Sparkles aria-hidden="true" /> Location Decathlon Tahiti</p>
          <h1>{product.name}</h1>
          <p className="product-intro">{product.intro}</p>
          <div className="product-best-for"><Check aria-hidden="true" /><span><strong>Idéal pour</strong>{product.bestFor}</span></div>
          <div className="product-price-panel">
            <div><small>Demi-journée</small><strong>{product.price}</strong></div>
            <div><small>Journée</small><strong>{product.dayPrice}</strong></div>
          </div>
          <a className="button button-primary product-book-button" href={`/?produit=${product.id}#reserver`}>Réserver ce modèle <ChevronRight aria-hidden="true" /></a>
          <p className="product-payment-note">Paiement en magasin lors du retrait.</p>
        </div>
      </section>

      <section className="product-info-section">
        <div className="section-shell product-info-layout">
          <div className="product-specs-copy">
            <p className="eyebrow">Avant de réserver</p>
            <h2>Les caractéristiques<br /><em>en un coup d’œil.</em></h2>
            <p>Retrouve les données essentielles du modèle de référence pour choisir un matériel qui te convient.</p>
          </div>
          <dl className="spec-grid" aria-label={`Caractéristiques de ${product.name}`}>
            {product.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="section-shell product-utility-layout">
        <article className="included-card">
          <p className="eyebrow"><Check aria-hidden="true" /> Dans ta location</p>
          <h2>Prêt à utiliser.</h2>
          <ul>{product.included.map((item) => <li key={item}><Check aria-hidden="true" /> {item}</li>)}</ul>
        </article>
        <article className="product-advice-card">
          <p className="eyebrow"><ShieldCheck aria-hidden="true" /> Bon à savoir</p>
          <p>{product.advice}</p>
          <a href={product.referenceUrl} target="_blank" rel="noreferrer">Voir la fiche technique de référence <ExternalLink aria-hidden="true" /></a>
        </article>
      </section>

      <section className="store-section product-store-section">
        <div className="section-shell store-layout">
          <div><p className="eyebrow">Ton point de retrait</p><h2>On se retrouve<br /><em>à Punaauia.</em></h2></div>
          <div className="store-details"><MapPin aria-hidden="true" /><div><strong>Decathlon Tahiti</strong><p>Côté Phenix, Punaauia<br />Lun–ven 8h30–18h · sam 8h–18h · dim 8h–13h</p></div><a href={`/?produit=${product.id}#reserver`} aria-label={`Réserver ${product.name}`}><ChevronRight aria-hidden="true" /></a></div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Footer() {
  return <footer>
    <div className="footer-brand"><img src="/decathlon-logo.svg" alt="Decathlon" /><span>TAHITI · LOCATION</span></div>
    <div className="footer-links"><a href="/#comment">Fonctionnement</a><a href="/#regles">Règles de location</a><a href="/#faq">FAQ</a></div>
    <span>© 2026 · Le sport, accessible à tous.</span>
  </footer>;
}

function RentalRules() {
  const rules = [
    { icon: FileCheck2, title: 'Réserver', text: 'La réservation en ligne met ton matériel de côté. Elle est confirmée sous réserve de disponibilité réelle au moment du retrait.' },
    { icon: UserRoundCheck, title: 'Retirer', text: 'Passe au magasin Decathlon Tahiti avec ta confirmation et une pièce d’identité. Le contrat de location est finalisé sur place.' },
    { icon: CreditCard, title: 'Régler', text: 'Le paiement se fait en magasin, en francs Pacifique. Une caution peut être demandée selon le produit et les conditions du magasin.' },
    { icon: RotateCcw, title: 'Restituer', text: 'Rapporte le matériel propre et complet, à la date et à l’heure prévues sur le contrat, avant la fermeture du magasin.' },
  ];

  return <section id="regles" className="rules-section">
    <div className="section-shell">
      <div className="rules-heading"><div><p className="eyebrow">Location à Tahiti</p><h2>Les règles,<br /><em>simplement.</em></h2></div><p>Un parcours inspiré de la location Decathlon, adapté à un retrait et un retour directement à Punaauia.</p></div>
      <div className="rules-grid">{rules.map(({ icon: Icon, title, text }, index) => <article className="rule-card" key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className="rules-notice"><ShieldCheck aria-hidden="true" /><p><strong>À retenir :</strong> ces informations préparent ta location. Les conditions contractuelles définitives, l’état du matériel et les éventuelles garanties sont confirmés avec l’équipe lors du retrait.</p></div>
    </div>
  </section>;
}

function Faq() {
  return <section id="faq" className="faq-section section-shell">
    <div className="faq-heading"><p className="eyebrow">Aide & support</p><h2>Toutes les réponses<br /><em>à tes questions.</em></h2><p>Besoin d’un renseignement avant de réserver ? Les réponses essentielles sont ici.</p></div>
    <div className="faq-list">{faqItems.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}<ChevronDown aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
  </section>;
}

function Home() {
  const [selectedId, setSelectedId] = useState(requestedEquipmentId);
  const [selectedDate, setSelectedDate] = useState(() => dateInDays(1));
  const [selectedDuration, setSelectedDuration] = useState<RentalDuration>('half-day');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const selectedEquipment = useMemo(() => getEquipment(selectedId) ?? equipment[0], [selectedId]);
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
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return setNotice('Indique ton prénom, ton nom et ton adresse e-mail pour confirmer.');
    if (!acceptedRules) return setNotice('Confirme que tu as lu les règles de location avant de valider.');
    setIsSubmitting(true);
    setNotice('');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: selectedId, date: selectedDate, time: selectedTime, duration: selectedDuration, name: `${firstName.trim()} ${lastName.trim()}`, email }),
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

  return (
    <main>
      <SiteHeader />
      <section id="accueil" className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles aria-hidden="true" /> Tout le matériel, sans contrainte</p>
          <h1>Testez, <em>approuvez, achetez.</em></h1>
          <p className="hero-text">Tennis, padel, surf ou vélo électrique : choisis ton matériel et réserve-le pour la demi-journée ou la journée.</p>
          <div className="hero-actions"><a className="button button-primary" href="#reserver">Trouver mon créneau <ChevronRight aria-hidden="true" /></a><a className="text-link" href="#equipements">Voir les équipements</a></div>
          <div className="hero-notes" aria-label="Les avantages de la location"><span><Check aria-hidden="true" /> Matériel vérifié</span><span><Check aria-hidden="true" /> Retrait rapide</span><span><Check aria-hidden="true" /> Paiement en magasin</span></div>
        </div>
        <div className="hero-image-wrap"><img src="/images/tahiti-home-banner.png" alt="Visuel officiel Decathlon Tahiti" className="hero-image" /><div className="hero-sticker"><Sparkles aria-hidden="true" /><span>Choisis.<br />Réserve. Profite.</span></div></div>
      </section>

      <section id="equipements" className="section-shell equipment-section">
        <div className="section-heading"><div><p className="eyebrow">À toi de jouer</p><h2>Choisis ton matériel.</h2></div><p>Quatre essentiels sélectionnés pour jouer, glisser ou rouler. Ouvre la fiche pour voir leurs dimensions et caractéristiques.</p></div>
        <div className="equipment-grid">{equipment.map((item) => <EquipmentCard item={item} key={item.id} />)}</div>
      </section>

      <section id="reserver" className="booking-section">
        <div className="section-shell booking-layout">
          <div className="booking-intro"><p className="eyebrow">Réservation en ligne</p><h2>Un créneau, et c’est parti.</h2><p>Choisis ton matériel, la date et l’horaire de retrait. Les créneaux déjà réservés se verrouillent automatiquement.</p><div className="booking-tip"><ShieldCheck aria-hidden="true" /> Ton matériel est mis de côté dès la confirmation.</div></div>
          <div className="booking-card" aria-live="polite">
            {confirmation ? (
              <div className="confirmation"><div className="confirmation-icon"><Check aria-hidden="true" /></div><p className="eyebrow">Réservation confirmée</p><h3>Merci pour ta réservation !</h3><p>Tu recevras par mail les informations de ta réservation. Viens en magasin récupérer et payer ta location.</p><div className="confirmation-summary"><span>{selectedEquipment.name} · {selectedDurationLabel}</span><span>{prettyDate(selectedDate)} · {selectedTime}</span></div><div className="confirmation-hours"><Clock3 aria-hidden="true" /><div><strong>Pour récupérer ton matériel</strong><span>Présente ta confirmation et une pièce d’identité. Fermeture à 18h du lundi au samedi, et à 13h le dimanche.</span></div></div><button className="button button-secondary" type="button" onClick={() => setConfirmation(false)}>Réserver un autre créneau</button></div>
            ) : (
              <>
                <div className="booking-card-top"><div><span className="booking-step">01</span><h3>Ta location</h3></div><span className="booking-price">{displayedPrice}<small> / {selectedDurationLabel.toLowerCase()}</small></span></div>
                <label className="field-label" htmlFor="equipment">Matériel</label>
                <select id="equipment" className="select-control" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{equipment.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                <a className="selected-product-link" href={`/produits/${selectedEquipment.id}`}>Voir les caractéristiques de ce modèle <ChevronRight aria-hidden="true" /></a>
                <div className="field-pair"><div><label className="field-label" htmlFor="date">Date de retrait</label><div className="field-with-icon"><CalendarDays aria-hidden="true" /><input id="date" type="date" min={dateInDays(0)} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></div></div><div><span className="field-label">Choisis ton tarif</span><div className="duration-options" role="group" aria-label="Durée de location">{rentalDurations.map((duration) => { const durationPrice = duration.id === 'day' ? selectedEquipment.dayPrice : selectedEquipment.price; return <button key={duration.id} type="button" className={`duration-option ${selectedDuration === duration.id ? 'duration-option-selected' : ''}`} aria-pressed={selectedDuration === duration.id} onClick={() => { setSelectedDuration(duration.id); setSelectedTime(null); }}><Clock3 aria-hidden="true" /><span className="duration-option-copy"><span>{duration.label}</span><small>{duration.detail}</small></span><strong>{durationPrice}</strong></button>; })}</div></div></div>
                <div className="slot-header"><span className="field-label">Heure de retrait</span><small>{availabilityLabel}</small></div>
                <div className="slot-grid">{timeSlots.map((time) => { const unavailable = bookedSlots.includes(time) || fullDayUnavailable; return <button key={time} type="button" className={`slot ${selectedTime === time ? 'slot-selected' : ''}`} disabled={isLoadingSlots || unavailable} onClick={() => setSelectedTime(time)}>{time}<small>{unavailable ? 'Indisponible' : 'Disponible'}</small></button>; })}</div>
                <div className="customer-fields"><div><label className="field-label" htmlFor="first-name">Ton prénom</label><input id="first-name" className="text-control" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Prénom" autoComplete="given-name" /></div><div><label className="field-label" htmlFor="last-name">Ton nom</label><input id="last-name" className="text-control" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Nom" autoComplete="family-name" /></div><div className="customer-email"><label className="field-label" htmlFor="email">Ton e-mail</label><div className="field-with-icon"><Mail aria-hidden="true" /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="toi@email.com" autoComplete="email" /></div></div></div>
                <label className="rental-consent"><input type="checkbox" checked={acceptedRules} onChange={(event) => setAcceptedRules(event.target.checked)} /><span>J’ai lu les <a href="#regles">règles de location à Tahiti</a> et je comprends que le contrat est finalisé en magasin lors du retrait.</span></label>
                {notice && <p className="form-notice" role="status">{notice}</p>}
                <button className="button button-primary confirm-button" type="button" onClick={reserveSlot} disabled={isSubmitting || isLoadingSlots}>{isSubmitting ? 'Confirmation…' : 'Valider ma réservation'} <ChevronRight aria-hidden="true" /></button><p className="payment-note">Aucun paiement en ligne. Tu règles ta location lors du retrait.</p>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="comment" className="section-shell steps-section"><div className="section-heading compact-heading"><div><p className="eyebrow">Comment ça marche</p><h2>Quatre étapes,<br /><em>zéro détour.</em></h2></div><p>Le parcours Decathlon Location, pensé ici pour un retrait simple et rapide à Punaauia.</p></div><div className="steps"><article><span>01</span><CalendarDays aria-hidden="true" /><h3>Tu choisis</h3><p>Ton matériel, ton tarif, la date et le créneau qui te conviennent.</p></article><article><span>02</span><FileCheck2 aria-hidden="true" /><h3>Tu réserves</h3><p>Ton équipement est mis de côté dès la confirmation de ton créneau.</p></article><article><span>03</span><PackageCheck aria-hidden="true" /><h3>Tu récupères</h3><p>Tu passes au magasin pour vérifier, récupérer et régler ta location.</p></article><article><span>04</span><Waves aria-hidden="true" /><h3>Tu profites</h3><p>Après ta session, tu restitues le matériel complet à l’heure prévue.</p></article></div></section>
      <RentalRules />
      <Faq />
      <section id="magasin" className="store-section"><div className="section-shell store-layout"><div><p className="eyebrow">Ton point de retrait</p><h2>On se retrouve<br /><em>à Punaauia.</em></h2></div><div className="store-details"><MapPin aria-hidden="true" /><div><strong>Decathlon Tahiti</strong><p>Côté Phenix, Punaauia<br />Lun–ven 8h30–18h · sam 8h–18h · dim 8h–13h</p></div><a href="#reserver" aria-label="Réserver un créneau"><ChevronRight aria-hidden="true" /></a></div></div></section>
      <Footer />
    </main>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(() => typeof window === 'undefined' ? '/' : window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', updatePath);
    return () => window.removeEventListener('popstate', updatePath);
  }, []);

  const product = productFromPath(pathname);
  return product ? <ProductDetails product={product} /> : <Home />;
}
