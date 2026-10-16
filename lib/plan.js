// Plano fixo do app: treino, cardio e alimentação.
// Metas calculadas para déficit alto (~1.800 kcal) com proteína alta para segurar massa.

export const TARGETS = {
  kcal: 1800,
  protein: 180,
  water: 3000,
  startKg: 93,
  goalKg: 85,
  gymDays: 5,
  cardioMin: 3,
  cardioMax: 4,
};

export const WEEK = [
  {
    key: 'seg',
    short: 'SEG',
    name: 'Segunda',
    title: 'Peito + Tríceps',
    gym: true,
    cardio: null,
    exercises: [
      { id: 'seg1', name: 'Supino reto (máquina ou halteres)', sets: 4, reps: '8–10', rest: 90, tip: 'Desça devagar e empurre firme. Ombros colados no banco.' },
      { id: 'seg2', name: 'Supino inclinado com halteres', sets: 3, reps: '10', rest: 90, tip: 'Banco a 30°. Cotovelos a 45° do corpo.' },
      { id: 'seg3', name: 'Crucifixo na máquina (peck deck)', sets: 3, reps: '12', rest: 60, tip: 'Aperte o peito no final do movimento.' },
      { id: 'seg4', name: 'Tríceps na polia (corda)', sets: 3, reps: '12', rest: 60, tip: 'Cotovelos parados ao lado do corpo.' },
      { id: 'seg5', name: 'Tríceps testa', sets: 3, reps: '12', rest: 60, tip: 'Desça até a testa, sem mexer os ombros.' },
    ],
  },
  {
    key: 'ter',
    short: 'TER',
    name: 'Terça',
    title: 'Costas + Bíceps',
    gym: true,
    cardio: { min: 30, label: 'Cardio de 30 min depois do treino' },
    exercises: [
      { id: 'ter1', name: 'Puxada na frente', sets: 4, reps: '8–10', rest: 90, tip: 'Puxe com os cotovelos, peito para frente.' },
      { id: 'ter2', name: 'Remada baixa (triângulo)', sets: 4, reps: '10', rest: 90, tip: 'Costas retas. Aperte as escápulas no final.' },
      { id: 'ter3', name: 'Remada unilateral com halter', sets: 3, reps: '10', rest: 60, tip: 'Puxe o halter em direção ao quadril.' },
      { id: 'ter4', name: 'Rosca direta', sets: 3, reps: '10–12', rest: 60, tip: 'Sem balançar o corpo.' },
      { id: 'ter5', name: 'Rosca martelo', sets: 3, reps: '12', rest: 60, tip: 'Pegada neutra, controle na descida.' },
    ],
  },
  {
    key: 'qua',
    short: 'QUA',
    name: 'Quarta',
    title: 'Pernas (quadríceps)',
    gym: true,
    cardio: null,
    exercises: [
      { id: 'qua1', name: 'Leg press', sets: 4, reps: '10–12', rest: 120, tip: 'Pés na largura dos ombros. Não trave os joelhos.' },
      { id: 'qua2', name: 'Agachamento no smith', sets: 3, reps: '10', rest: 120, tip: 'Desça até as coxas ficarem paralelas ao chão.' },
      { id: 'qua3', name: 'Cadeira extensora', sets: 3, reps: '12', rest: 60, tip: 'Segure 1 segundo no topo.' },
      { id: 'qua4', name: 'Afundo com halteres', sets: 3, reps: '10 por perna', rest: 75, tip: 'Tronco reto, joelho da frente sobre o pé.' },
      { id: 'qua5', name: 'Panturrilha em pé', sets: 4, reps: '15', rest: 45, tip: 'Suba bem alto e alongue embaixo.' },
    ],
  },
  {
    key: 'qui',
    short: 'QUI',
    name: 'Quinta',
    title: 'Ombros + Abdômen',
    gym: true,
    cardio: { min: 30, label: 'Cardio de 30 min depois do treino' },
    exercises: [
      { id: 'qui1', name: 'Desenvolvimento com halteres', sets: 4, reps: '10', rest: 90, tip: 'Empurre para cima sem arquear as costas.' },
      { id: 'qui2', name: 'Elevação lateral', sets: 4, reps: '12–15', rest: 60, tip: 'Leve o halter até a altura do ombro.' },
      { id: 'qui3', name: 'Crucifixo inverso na máquina', sets: 3, reps: '12', rest: 60, tip: 'Abra os braços puxando com as costas.' },
      { id: 'qui4', name: 'Encolhimento com halteres', sets: 3, reps: '12', rest: 60, tip: 'Suba os ombros em direção às orelhas.' },
      { id: 'qui5', name: 'Abdominal na máquina', sets: 3, reps: '15', rest: 45, tip: 'Contraia o abdômen, sem puxar com o pescoço.' },
      { id: 'qui6', name: 'Prancha', sets: 3, reps: '40 s', rest: 45, tip: 'Corpo reto, barriga firme.' },
    ],
  },
  {
    key: 'sex',
    short: 'SEX',
    name: 'Sexta',
    title: 'Posterior + Glúteos',
    gym: true,
    cardio: null,
    exercises: [
      { id: 'sex1', name: 'Stiff com halteres', sets: 4, reps: '10', rest: 90, tip: 'Quadril para trás, costas retas, joelhos levemente flexionados.' },
      { id: 'sex2', name: 'Mesa flexora', sets: 4, reps: '12', rest: 60, tip: 'Suba controlando e desça devagar.' },
      { id: 'sex3', name: 'Elevação pélvica', sets: 3, reps: '12', rest: 75, tip: 'Aperte o glúteo no topo.' },
      { id: 'sex4', name: 'Cadeira abdutora', sets: 3, reps: '15', rest: 60, tip: 'Abra as pernas sem balançar o tronco.' },
      { id: 'sex5', name: 'Panturrilha sentado', sets: 4, reps: '15', rest: 45, tip: 'Pausa de 1 segundo no topo.' },
    ],
  },
  {
    key: 'sab',
    short: 'SÁB',
    name: 'Sábado',
    title: 'Cardio',
    gym: false,
    cardio: { min: 40, label: 'Cardio de 40 min em ritmo constante' },
    exercises: [],
  },
  {
    key: 'dom',
    short: 'DOM',
    name: 'Domingo',
    title: 'Descanso ativo',
    gym: false,
    cardio: { min: 30, label: 'Caminhada de 30 min (opcional, é o 4º cardio)' },
    exercises: [],
  },
];

export const CARDIO_KINDS = ['Esteira', 'Bicicleta', 'Caminhada', 'Elíptico'];

export const MEALS = [
  { id: 'm1', name: 'Café da manhã', time: '07:00', items: ['3 ovos mexidos', '1 banana', '20 g de aveia'], kcal: 385, protein: 23 },
  { id: 'm2', name: 'Lanche da manhã', time: '10:00', items: ['1 iogurte natural desnatado', '1 maçã'], kcal: 150, protein: 9 },
  { id: 'm3', name: 'Almoço', time: '12:30', items: ['180 g de frango (peito ou coxa sem pele)', '100 g de arroz', '1 concha de feijão', 'Salada à vontade'], kcal: 540, protein: 63 },
  { id: 'm4', name: 'Lanche da tarde', time: '16:00', items: ['1 lata de atum ou sardinha', '1 fatia de pão'], kcal: 190, protein: 28 },
  { id: 'm5', name: 'Jantar', time: '19:30', items: ['180 g de frango ou patinho moído', '80 g de arroz', 'Legumes à vontade'], kcal: 460, protein: 57 },
  { id: 'm6', name: 'Ceia', time: '22:00', items: ['1 iogurte natural desnatado'], kcal: 90, protein: 9 },
];

export const HUNGER_FREE = [
  'Salada, pepino, tomate, repolho, alface e abobrinha à vontade',
  'Sopa de legumes sem massa',
  'Gelatina zero',
  'Café ou chá sem açúcar',
  'Água com gás e limão',
  'Pipoca sem óleo (1 xícara ≈ 30 kcal)',
];

export const SWAPS = [
  'Frango ↔ patinho moído ↔ ovos ↔ sardinha ↔ soja texturizada',
  'Arroz ↔ batata cozida ou mandioca (mesma quantidade)',
  'Aveia ↔ 1 fatia de pão',
  'Fruta ↔ outra fruta da estação (a mais barata)',
];

export function localDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(d = new Date()) {
  return WEEK[(d.getDay() + 6) % 7].key;
}
