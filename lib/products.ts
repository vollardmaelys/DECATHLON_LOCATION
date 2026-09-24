export type ProductSpec = {
  label: string;
  value: string;
};

export type Equipment = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: string;
  dayPrice: string;
  detail: string;
  tag: string;
  intro: string;
  bestFor: string;
  specs: ProductSpec[];
  included: string[];
  advice: string;
  referenceUrl: string;
};

export const equipment: Equipment[] = [
  {
    id: 'tennis-tr500',
    name: 'Raquette de tennis TR500',
    category: 'Tennis',
    image: '/images/tennis.png',
    price: '1 500 F',
    dayPrice: '2 500 F',
    detail: '280 g · tamis 660 cm²',
    tag: 'Polyvalente',
    intro: 'Une raquette confortable et facile à prendre en main pour jouer, progresser ou reprendre le tennis.',
    bestFor: 'Tennis loisir et entraînement régulier',
    specs: [
      { label: 'Poids', value: '280 g' },
      { label: 'Tamis', value: '660 cm²' },
      { label: 'Longueur', value: '68,5 cm' },
      { label: 'Équilibre', value: '32 cm · neutre' },
      { label: 'Plan de cordage', value: '16 × 19' },
      { label: 'Manche', value: 'Grip 1 à 4' },
    ],
    included: ['Raquette cordée', '3 balles de tennis', 'Contrôle avant retrait'],
    advice: 'Choisis ton grip au retrait : l’équipe t’aidera à sélectionner une prise confortable.',
    referenceUrl: 'https://www.decathlon.fr/p/raquette-de-tennis-adulte-tr500/_/R-p-300399',
  },
  {
    id: 'padel-hybrid-metal',
    name: 'Raquette de padel Hybrid Metal',
    category: 'Padel',
    image: '/images/padel.png',
    price: '1 500 F',
    dayPrice: '2 500 F',
    detail: '365 g · surface 460 cm²',
    tag: 'Confort & contrôle',
    intro: 'Une raquette polyvalente qui associe confort à la frappe, contrôle et une bonne réserve de puissance.',
    bestFor: 'Joueurs réguliers, jeu polyvalent',
    specs: [
      { label: 'Poids', value: '365 g ± 5 g' },
      { label: 'Surface de tête', value: '460 cm²' },
      { label: 'Forme', value: 'Goutte d’eau' },
      { label: 'Épaisseur', value: '38 mm' },
      { label: 'Équilibre', value: 'Neutre' },
      { label: 'Noyau', value: 'Soft EVA' },
    ],
    included: ['Raquette de padel', '3 balles de padel', 'Dragonne de sécurité'],
    advice: 'Sa surface rugueuse aide à donner de l’effet ; garde toujours la dragonne au poignet pendant le jeu.',
    referenceUrl: 'https://www.decathlon.fr/p/raquette-de-padel-adulte-kuikma-hybrid-metal/329923/c93m8611553',
  },
  {
    id: 'surf-mousse-86',
    name: 'Planche de surf mousse 8’6',
    category: 'Surf',
    image: '/images/surf.png',
    price: '3 000 F',
    dayPrice: '5 000 F',
    detail: '90 L · leash et ailerons inclus',
    tag: 'Glisse stable',
    intro: 'Une mini-malibu en mousse stable et robuste, pensée pour profiter des petites à moyennes vagues.',
    bestFor: 'Débutants à réguliers · gabarit jusqu’à 100 kg',
    specs: [
      { label: 'Dimensions', value: '258 × 59,2 × 10,6 cm' },
      { label: 'Volume', value: '90 L' },
      { label: 'Poids', value: '6,8 kg avec ailerons' },
      { label: 'Shape', value: 'Mini-malibu mousse' },
      { label: 'Vagues', value: 'Petites à moyennes' },
      { label: 'Ailerons', value: '3 ailerons souples' },
    ],
    included: ['Leash de 2,5 m', '3 ailerons souples', 'Clé de serrage'],
    advice: 'Rince la planche à l’eau douce après la session et évite de la laisser en plein soleil.',
    referenceUrl: 'https://www.decathlon.fr/p/planche-de-surf-mousse-8-6-500-kaki/_/R-p-310810',
  },
  {
    id: 'vae-riverside-500e',
    name: 'Vélo VAE Riverside 500 E',
    category: 'Vélo électrique',
    image: 'https://contents.mediadecathlon.com/p1922090/k%24805ed784f8e4ec853c5b9939e4f67366/picture.jpg?f=3000x0&format=auto',
    price: '4 000 F',
    dayPrice: '6 500 F',
    detail: '250 W · jusqu’à 90 km d’autonomie',
    tag: 'Autonomie',
    intro: 'Un vélo à assistance électrique confortable pour les trajets du quotidien, les balades et les chemins faciles.',
    bestFor: 'Ville, route et chemins roulants',
    specs: [
      { label: 'Tailles', value: 'S à XL · 1,50 m à 2,01 m' },
      { label: 'Poids', value: '21,8 à 22,1 kg' },
      { label: 'Batterie', value: '418 Wh amovible' },
      { label: 'Moteur', value: '250 W · 42 Nm' },
      { label: 'Autonomie', value: '50 à 90 km*' },
      { label: 'Roues', value: '28 pouces · 8 vitesses' },
    ],
    included: ['Casque', 'Antivol', 'Éclairage et sonnette'],
    advice: '*L’autonomie dépend du relief, du niveau d’assistance, du poids transporté et de la météo.',
    referenceUrl: 'https://www.decathlon.fr/p/velo-tout-chemin-electrique-riverside-500-e-gris/_/R-p-169143',
  },
];

export const equipmentIds = new Set(equipment.map((item) => item.id));

export function getEquipment(id: string | null | undefined) {
  return equipment.find((item) => item.id === id);
}
