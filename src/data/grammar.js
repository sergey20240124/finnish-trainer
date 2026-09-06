// Grammar notes with worked examples, plus drillable fill-in-the-blank items.
// Each note: id, title, body (markdown-ish plain text), table (optional [[header...],[row...]])
export const grammarNotes = [
  {
    id: 'cases-intro',
    title: 'The case system (why Finnish has no prepositions)',
    body: `Finnish uses word endings ("cases") instead of most prepositions. Learn these gradually — you don't need all 15 at once, but these six cover most daily speech and most of the YKI test:

- Nominative: the dictionary form (talo = "house")
- Genitive (-n): possession ("of") — talon = "of the house"
- Partitive (-a/-ä/-ta/-tä): partial amount, negation, object — taloa
- Inessive (-ssa/-ssä): "in" — talossa = "in the house"
- Elative (-sta/-stä): "out of / from" — talosta = "from the house"
- Illative (-Vn/-hVn): "into" — taloon = "into the house"`,
    table: [
      ['Case', 'Ending', 'talo (house)', 'Meaning'],
      ['Nominative', '—', 'talo', 'the house'],
      ['Genitive', '-n', 'talon', "of the house"],
      ['Partitive', '-a', 'taloa', 'house (partial/object)'],
      ['Inessive', '-ssa', 'talossa', 'in the house'],
      ['Elative', '-sta', 'talosta', 'from the house'],
      ['Illative', '-on', 'taloon', 'into the house'],
    ],
  },
  {
    id: 'cases-location-2',
    title: 'External location cases (on/at instead of in)',
    body: `A second set of location cases is used for surfaces and people/events, instead of "in/out of/into":

- Adessive (-lla/-llä): "on / at, with" — pöydällä = "on the table"
- Ablative (-lta/-ltä): "off of, from (a person/surface)" — pöydältä = "from the table"
- Allative (-lle): "onto, to (a person)" — pöydälle = "onto the table"

Rule of thumb: buildings/countries usually take -ssa/-sta/-Vn (koulussa = at school), while people, events, and open surfaces usually take -lla/-lta/-lle (Villellä = at Ville's place).`,
    table: [
      ['Case', 'Ending', 'pöytä (table)', 'Meaning'],
      ['Adessive', '-lla', 'pöydällä', 'on/at the table'],
      ['Ablative', '-lta', 'pöydältä', 'from the table'],
      ['Allative', '-lle', 'pöydälle', 'onto the table'],
    ],
  },
  {
    id: 'consonant-gradation',
    title: 'Consonant gradation (k/p/t weakening)',
    body: `When a case ending is added, k, p, or t in the middle of a word often "weakens": kk→k, pp→p, tt→t, k→(disappears), p→v, t→d.

Examples: matka → matkalla (trip → on the trip), kauppa → kaupassa (shop → in the shop), katu → kadulla (street → on the street). This is one of the trickiest parts of Finnish and mostly learned through exposure — don't try to memorize every rule at once.`,
  },
  {
    id: 'verb-types',
    title: 'Verb conjugation types (verbityypit)',
    body: `Finnish verbs fall into 6 conjugation types based on their infinitive ending. Present tense of "puhua" (type 1, to speak):

minä puhun (I speak) · sinä puhut (you speak) · hän puhuu (he/she speaks)
me puhumme (we speak) · te puhutte (you pl. speak) · he puhuvat (they speak)

Negation uses "ei" + a special negative verb form: en puhu, et puhu, ei puhu, emme puhu, ette puhu, eivät puhu.`,
    table: [
      ['Person', 'puhua (speak)', 'olla (be)', 'negative + olla'],
      ['minä', 'puhun', 'olen', 'en ole'],
      ['sinä', 'puhut', 'olet', 'et ole'],
      ['hän', 'puhuu', 'on', 'ei ole'],
      ['me', 'puhumme', 'olemme', 'emme ole'],
      ['te', 'puhutte', 'olette', 'ette ole'],
      ['he', 'puhuvat', 'ovat', 'eivät ole'],
    ],
  },
  {
    id: 'past-tense',
    title: 'Past tense (imperfekti)',
    body: `The past tense is formed with -i-. Example with "puhua": puhuin (I spoke), puhuit, puhui, puhuimme, puhuitte, puhuivat. Many verbs shift their stem vowel before the -i- (e.g. sanoa → sanoin, not "sanaoin"). This tense is essential for YKI writing tasks that ask you to describe past events.`,
  },
  {
    id: 'kysymyssanat',
    title: 'Question formation (-ko/-kö)',
    body: `Yes/no questions attach -ko or -kö to the first word: Puhutko suomea? (Do you speak Finnish?), Oletko kotona? (Are you home?). Open questions use question words (mikä, kuka, missä, milloin, miksi...) at the start of the sentence, same word order as a statement.`,
  },
]

// Fill-in-the-blank drills tied to the grammar notes above.
export const grammarDrills = [
  { id: 'g1', prompt: 'Minä asun ___ (talo, inessive: "in the house").', answer: 'talossa', hint: 'inessive -ssa', noteId: 'cases-intro' },
  { id: 'g2', prompt: 'Tulen juuri ___ (koulu, elative: "from school").', answer: 'koulusta', hint: 'elative -sta', noteId: 'cases-intro' },
  { id: 'g3', prompt: 'Menen ___ (Suomi, illative: "to/into Finland").', answer: 'Suomeen', hint: 'illative -Vn', noteId: 'cases-intro' },
  { id: 'g4', prompt: 'Kirja on ___ (pöytä, adessive: "on the table").', answer: 'pöydällä', hint: 'adessive -lla, note p→v gradation', noteId: 'cases-location-2' },
  { id: 'g5', prompt: 'Tämä on ___ (minä, genitive: "my/of me") kirja.', answer: 'minun', hint: 'genitive of minä', noteId: 'cases-intro' },
  { id: 'g6', prompt: 'Hän asuu ___ (katu, adessive: "on … street").', answer: 'kadulla', hint: 'adessive; t→d gradation', noteId: 'consonant-gradation' },
  { id: 'g7', prompt: 'Minä ___ (puhua, present, minä-form) suomea.', answer: 'puhun', hint: 'type 1 verb present', noteId: 'verb-types' },
  { id: 'g8', prompt: 'He ___ (olla, present, he-form) täällä.', answer: 'ovat', hint: 'olla conjugation', noteId: 'verb-types' },
  { id: 'g9', prompt: 'Minä en ___ (puhua) ruotsia.', answer: 'puhu', hint: 'negative verb has no personal ending in 1st/2nd person', noteId: 'verb-types' },
  { id: 'g10', prompt: 'Eilen minä ___ (puhua, past, minä-form) opettajan kanssa.', answer: 'puhuin', hint: 'imperfekti -i-', noteId: 'past-tense' },
  { id: 'g11', prompt: '___ (puhua-ko) sinä englantia?', answer: 'Puhutko', hint: '-ko question form', noteId: 'kysymyssanat' },
  { id: 'g12', prompt: 'Ostan ___ (leipä, partitive: some bread).', answer: 'leipää', hint: 'partitive -ä', noteId: 'cases-intro' },
]
