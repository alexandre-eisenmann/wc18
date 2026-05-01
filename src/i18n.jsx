import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'bolao_lang'
const DEFAULT_LANG = 'pt'
export const SUPPORTED_LANGS = ['pt', 'en']

const messages = {
  pt: {
    'app.brand': 'Bolão dos Bolões',

    'nav.home': 'HOME',
    'nav.bids': 'JOGOS',
    'nav.leaderboard': 'TABELÃO',
    'nav.ranking': 'RANKING',
    'nav.blog': 'BLOG',

    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.cancel': 'Cancelar',
    'auth.loginToSeeYourBids': ' para ver seus jogos',
    'auth.loginToPinFriendsPre': ' para ',
    'auth.loginToPinFriendsAction': 'pinar',
    'auth.loginToPinFriendsPost': ' seus amigos',

    'home.hostingTitle': 'Copa USA/Canadá/México',
    'home.heroIntro': 'Faça seus palpites para a primeira fase da Copa do Mundo 2026. Aprenda como os pontos são calculados no nosso ',
    'home.heroRulesLink': 'regulamento',
    'home.heroIntroEnd': '.',
    'home.daysLeftPrefix': 'FALTAM',
    'home.daysLeftSuffix': 'DIAS PARA A COPA',
    'home.scroll': 'SCROLL',
    'home.yearLabel.2018': '2018 Rússia',
    'home.yearLabel.2022': '2022 Catar',
    'home.yearLabel.2026': '2026 USA/Canadá/México',
    'home.comingSoon': '{year} em breve',

    'viz.title': 'CHUVA DE PALPITES',
    'viz.description': 'Cada gráfico mostra como os palpites se distribuíram em um jogo. A área de cada círculo é proporcional ao número de apostadores naquele placar. Os empates aparecem na linha vertical que passa pela origem (0 a 0) e vai até o resultado 5 a 5.',
    'viz.animate': 'Animate',

    'bid.draftHeader': 'RASCUNHO (draft)',
    'bid.waitingPaymentHeader': 'AGUARDANDO PAGAMENTO (waiting payment)',
    'bid.paidHeader': 'PAGOS (payed)',
    'bid.statusIncomplete': 'Incompleto',
    'bid.statusWaiting': 'Aguardando Pagamento',
    'bid.statusPaid': 'Pago',
    'bid.statusComplete': 'Completo',
    'bid.save': 'Salvar',
    'bid.deleteTitle': 'Apagar {name}?',
    'bid.deleteContent': 'Confira se é este o jogo que você deseja apagar',
    'bid.deleteConfirm': 'Apague',
    'bid.newGameBubble': 'Clique aqui para criar o seu jogo. Ei, vc pode criar quantos jogos quiser! Lembre-se de mudar o nome para evitar duplicação',
    'bid.payBubble': 'Não esqueça de pagar! Toque no cartão à direita (mesma ideia do + na linha de cima).',
    'bid.removeBubble': 'Você pode voltar seu jogo ao estágio rascunho acionando este botão aqui',
    'bid.addToCartBubble': 'Depois de completar todos os resultados não esqueça de acionar o botão carrinho de compras para selecionar o jogo para pagamento.',
    'bid.fieldRequired': 'Campo obrigatório',
    'bid.namePlaceholder': 'Nome',
    'bid.emailPlaceholder': 'Email',
    'bid.mobilePlaceholder': 'Celular',
    'bid.payAria': 'Ir para pagamento',

    'group.label': 'Grupo',

    'ranking.title': 'Ranking',
    'ranking.myBidsHeader': 'MEUS JOGOS (my bids)',
    'ranking.leaderboardHeader': 'CLASSIFICAÇÃO GERAL (leaderboard)',

    'leaderboard.participants': '{count} participantes',

    'payment.title': 'Pagamento',
    'payment.noBids': 'Nenhum palpite aguardando pagamento. Complete e adicione seu jogo ao carrinho primeiro.',
    'payment.backToBids': 'Voltar para Jogos',
    'payment.tableName': 'Nome',
    'payment.tableValue': 'Valor',
    'payment.total': 'Total',
    'payment.goToPayment': 'Ir para pagamento',
    'payment.processing': 'Processando...',
    'payment.pay': 'Pagar',
    'payment.error': 'Erro no pagamento. Tente novamente.',
    'payment.confirmed': 'Pagamento confirmado!',
    'payment.activated': 'Seus palpites estão ativos. Boa sorte!',
    'payment.viewRanking': 'Ver Ranking',
    'payment.missingKey': 'Chave do Stripe ausente',

    'rules.title': 'Regulamento',
    'rules.distributionIntro': 'O valor total líquido (*) arrecadado será dividido da seguinte forma:',
    'rules.first': '1º lugar:',
    'rules.second': '2º lugar:',
    'rules.third': '3º lugar:',
    'rules.tieIntro': 'Em caso de empate, os jogadores empatados dividem igualmente o valor combinado de todos os prêmios que ocupam — nenhum prêmio passa para a próxima posição. Por exemplo: dois jogadores empatados em 1º dividem os prêmios de 1º + 2º juntos (70% + 25% = 95%, ou seja, 47,5% cada), e o próximo jogador é o 3º.',
    'rules.scoringIntro': 'Pontuação:',
    'rules.score8': 'Placar exato:',
    'rules.score8Pts': '8 pontos',
    'rules.score5': 'Diferença de gols correta (mas placar errado):',
    'rules.score5Pts': '5 pontos',
    'rules.score3': 'Resultado correto (vitória/empate/derrota) mas diferença de gols errada:',
    'rules.score3Pts': '3 pontos',
    'rules.score0': 'Resultado errado:',
    'rules.score0Pts': '0 pontos',
    'rules.disclaimer': '(*) Valor total arrecadado menos custos de transação e hosting.',
    'rules.payoutLabel': 'Pagamento dos prêmios:',
    'rules.payoutBody': ' os pagamentos via cartão de crédito levam cerca de 30 dias para serem compensados pelo nosso sistema de pagamentos, por isso os prêmios só serão pagos depois que esses valores forem liberados.',
    'rules.subsLabel': 'Substituição de seleções:',
    'rules.subsBody': ' caso algum país seja substituído antes ou durante a Copa, os palpites feitos para os jogos daquela seleção serão considerados para o substituto. Caso algum país seja excluído e a partida não seja realizada, não haverá pontuação para esse jogo.',

    'notAvailable.message': 'Apostas Encerradas',
  },

  en: {
    'app.brand': 'Bolão dos Bolões',

    'nav.home': 'HOME',
    'nav.bids': 'BIDS',
    'nav.leaderboard': 'LEADERBOARD',
    'nav.ranking': 'RANKING',
    'nav.blog': 'BLOG',

    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.cancel': 'Cancel',
    'auth.loginToSeeYourBids': ' to see your bids',
    'auth.loginToPinFriendsPre': ' to ',
    'auth.loginToPinFriendsAction': 'pin',
    'auth.loginToPinFriendsPost': ' your friends',

    'home.hostingTitle': 'USA/Canada/Mexico World Cup',
    'home.heroIntro': 'Place your bids for the 2026 World Cup group stage. Learn how points are calculated in our ',
    'home.heroRulesLink': 'rules',
    'home.heroIntroEnd': '.',
    'home.daysLeftPrefix': 'ONLY',
    'home.daysLeftSuffix': 'DAYS UNTIL THE WORLD CUP',
    'home.scroll': 'SCROLL',
    'home.yearLabel.2018': '2018 Russia',
    'home.yearLabel.2022': '2022 Qatar',
    'home.yearLabel.2026': '2026 USA/Canada/Mexico',
    'home.comingSoon': '{year} coming soon',

    'viz.title': 'BID DISTRIBUTION',
    'viz.description': 'Each chart shows how the bids spread for one match. The area of each circle is proportional to the number of bidders for that score. Draws appear along the vertical line through the origin (0–0 up to 5–5).',
    'viz.animate': 'Animate',

    'bid.draftHeader': 'DRAFT',
    'bid.waitingPaymentHeader': 'WAITING PAYMENT',
    'bid.paidHeader': 'PAID',
    'bid.statusIncomplete': 'Incomplete',
    'bid.statusWaiting': 'Waiting Payment',
    'bid.statusPaid': 'Paid',
    'bid.statusComplete': 'Complete',
    'bid.save': 'Save',
    'bid.deleteTitle': 'Delete {name}?',
    'bid.deleteContent': 'Make sure this is the bid you want to delete',
    'bid.deleteConfirm': 'Delete',
    'bid.newGameBubble': 'Click here to create your bid. You can create as many bids as you want — just remember to change the name to avoid duplicates.',
    'bid.payBubble': "Don't forget to pay! Tap the card on the right (same idea as the + button above).",
    'bid.removeBubble': 'You can move your bid back to draft using this button.',
    'bid.addToCartBubble': "Once you've filled in every result, don't forget to tap the cart button to mark the bid for payment.",
    'bid.fieldRequired': 'Required field',
    'bid.namePlaceholder': 'Name',
    'bid.emailPlaceholder': 'Email',
    'bid.mobilePlaceholder': 'Mobile Number',
    'bid.payAria': 'Go to payment',

    'group.label': 'Group',

    'ranking.title': 'Ranking',
    'ranking.myBidsHeader': 'MY BIDS',
    'ranking.leaderboardHeader': 'OVERALL LEADERBOARD',

    'leaderboard.participants': '{count} participants',

    'payment.title': 'Payment',
    'payment.noBids': 'No bids waiting for payment. Complete a bid and add it to the cart first.',
    'payment.backToBids': 'Back to Bids',
    'payment.tableName': 'Name',
    'payment.tableValue': 'Amount',
    'payment.total': 'Total',
    'payment.goToPayment': 'Go to payment',
    'payment.processing': 'Processing...',
    'payment.pay': 'Pay',
    'payment.error': 'Payment error. Please try again.',
    'payment.confirmed': 'Payment confirmed!',
    'payment.activated': 'Your bids are active. Good luck!',
    'payment.viewRanking': 'View Ranking',
    'payment.missingKey': 'Stripe key is missing',

    'rules.title': 'Rules',
    'rules.distributionIntro': 'The total net value (*) collected will be divided as follows:',
    'rules.first': '1st place:',
    'rules.second': '2nd place:',
    'rules.third': '3rd place:',
    'rules.tieIntro': 'In case of a tie, the tied players share equally the combined value of all prizes they occupy — no prize passes to the next rank. For example: two players tied for 1st split the 1st + 2nd prizes together (70% + 25% = 95%, so 47.5% each), and the next player is 3rd.',
    'rules.scoringIntro': 'Scoring:',
    'rules.score8': 'Exact score:',
    'rules.score8Pts': '8 points',
    'rules.score5': 'Correct goal difference (but wrong score):',
    'rules.score5Pts': '5 points',
    'rules.score3': 'Correct result (win/draw/loss) but wrong goal difference:',
    'rules.score3Pts': '3 points',
    'rules.score0': 'Wrong result:',
    'rules.score0Pts': '0 points',
    'rules.disclaimer': '(*) Total amount collected minus transaction costs and web hosting.',
    'rules.payoutLabel': 'Prize payout:',
    'rules.payoutBody': " credit card payments take around 30 days to clear through our payment processor, so prizes will only be paid out once those funds have settled.",
    'rules.subsLabel': 'Team substitutions:',
    'rules.subsBody': " if a country is replaced before or during the tournament, your bids for that team's fixtures will count toward the replacement team. If a country is removed and the match is not played, no points will be awarded for that fixture.",

    'notAvailable.message': 'Bidding is closed',
  },
}

function detectInitialLanguage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved
    }
  } catch (e) {
    // localStorage may be unavailable (private mode, SSR, etc.)
  }
  try {
    if (typeof navigator !== 'undefined') {
      const candidates = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || '']
      for (const candidate of candidates) {
        const lang = String(candidate).toLowerCase().split('-')[0]
        if (SUPPORTED_LANGS.includes(lang)) return lang
      }
    }
  } catch (e) {
    // ignore detection errors
  }
  return DEFAULT_LANG
}

function format(template, params) {
  if (!params) return template
  return Object.keys(params).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key])),
    template,
  )
}

function buildTranslator(language) {
  const dict = messages[language] || messages[DEFAULT_LANG]
  const fallback = messages[DEFAULT_LANG]
  return (key, params) => {
    const raw = (dict && dict[key] != null)
      ? dict[key]
      : (fallback && fallback[key] != null ? fallback[key] : key)
    return format(raw, params)
  }
}

export const LanguageContext = createContext({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: buildTranslator(DEFAULT_LANG),
})

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => detectInitialLanguage())

  useEffect(() => {
    try {
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.lang = language
      }
    } catch (e) {
      // ignore
    }
  }, [language])

  const setLanguage = (lang) => {
    if (!SUPPORTED_LANGS.includes(lang)) return
    setLanguageState(lang)
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang)
      }
    } catch (e) {
      // ignore persistence failures
    }
  }

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: buildTranslator(language),
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useT() {
  return useContext(LanguageContext)
}

export function LanguageSwitcher({ style, color, separatorColor, activeColor }) {
  const { language, setLanguage } = useT()
  const baseColor = color || 'rgba(220,220,220,0.8)'
  const sepColor = separatorColor || 'rgba(220,220,220,0.4)'
  const onColor = activeColor || 'white'

  const btnStyle = (active) => ({
    background: 'transparent',
    border: 'none',
    cursor: active ? 'default' : 'pointer',
    color: active ? onColor : baseColor,
    fontWeight: active ? 'bold' : 'normal',
    fontFamily: 'Lato',
    fontSize: '12px',
    padding: '0 4px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  })

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      <button
        type="button"
        aria-label="Português"
        onClick={() => setLanguage('pt')}
        style={btnStyle(language === 'pt')}
      >PT</button>
      <span style={{ color: sepColor }}>|</span>
      <button
        type="button"
        aria-label="English"
        onClick={() => setLanguage('en')}
        style={btnStyle(language === 'en')}
      >EN</button>
    </span>
  )
}
