export const DISCOVERY_LABELS = {
  accessibility: {
    loadingPhoto: (restaurantName: string) =>
      `Cargando foto de ${restaurantName}`,
    photo: (restaurantName: string) => `Foto de ${restaurantName}`,
    rouletteIdle: 'Ruleta de comida',
    rouletteSpinning: 'Ruleta girando',
    searchProgress: 'Buscando un restaurante cercano',
    settings: 'Abrir ajustes de la aplicación',
    weeklyHoursHide: 'Ocultar horario semanal',
    weeklyHoursShow: 'Mostrar horario semanal',
  },
  actions: {
    backToRoulette: 'Volver a la ruleta',
    openMaps: 'ABRIR EN MAPAS',
    openSettings: 'ABRIR AJUSTES',
    retry: 'INTENTAR DE NUEVO',
    spin: 'GIRAR RULETA',
    spinAgain: 'GIRAR OTRA VEZ',
    spinning: 'GIRANDO…',
  },
  brandName: 'Food Roulette',
  categories: {
    american_restaurant: 'Estadounidense',
    asian_restaurant: 'Asiática',
    bakery: 'Panadería',
    bar: 'Bar',
    bar_and_grill: 'Bar y parrilla',
    barbecue_restaurant: 'Parrilla',
    breakfast_restaurant: 'Desayunos',
    brunch_restaurant: 'Brunch',
    cafe: 'Cafetería',
    chinese_restaurant: 'China',
    coffee_shop: 'Café',
    fast_food_restaurant: 'Comida rápida',
    fine_dining_restaurant: 'Alta cocina',
    french_restaurant: 'Francesa',
    hamburger_restaurant: 'Hamburguesas',
    indian_restaurant: 'India',
    italian_restaurant: 'Italiana',
    japanese_restaurant: 'Japonesa',
    korean_restaurant: 'Coreana',
    mediterranean_restaurant: 'Mediterránea',
    mexican_restaurant: 'Mexicana',
    pizza_restaurant: 'Pizzería',
    ramen_restaurant: 'Ramen',
    restaurant: 'Restaurante',
    seafood_restaurant: 'Mariscos',
    steak_house: 'Cortes',
    sushi_restaurant: 'Sushi',
    thai_restaurant: 'Tailandesa',
    vegan_restaurant: 'Vegana',
    vegetarian_restaurant: 'Vegetariana',
  },
  error: {
    configuration:
      'El servicio de restaurantes no está configurado en esta versión de la app.',
    default:
      'No pudimos completar la búsqueda. Ajusta tus opciones e inténtalo de nuevo.',
    network:
      'No pudimos conectarnos al servicio de restaurantes. Revisa tu conexión e inténtalo de nuevo.',
    noResults:
      'No encontramos restaurantes cercanos con esas opciones. Prueba con un radio más amplio.',
    serviceUnavailable:
      'El servicio de restaurantes no está disponible temporalmente. Inténtalo de nuevo.',
    timeout: 'La búsqueda tardó demasiado. Inténtalo de nuevo.',
    title: 'No pudimos elegir un lugar',
    unexpected:
      'Ocurrió un problema al buscar un restaurante. Inténtalo de nuevo.',
  },
  home: {
    locationRequired: 'Necesitamos tu ubicación para buscar cerca de ti.',
    subtitle: 'Deja que el azar decida por ti.',
    title: '¿Qué vamos a\ncomer? 🍴',
  },
  hours: {
    available: 'Horario disponible',
    closeVerb: 'Cierra',
    closedNow: 'Cerrado ahora',
    openNow: 'Abierto ahora',
    openVerb: 'Abre',
    schedule: 'Horario',
    today: 'hoy',
    tomorrow: 'mañana',
    transition: (verb: string, day: string, time: string) =>
      `${verb} ${day} a las ${time}`,
  },
  loading: {
    messages: [
      'Explorando restaurantes…',
      'Consultando al chef…',
      'Evitando que comas lo mismo…',
      'Casi tenemos tu elección…',
    ],
    subtitle: 'Buscando un buen lugar cerca de ti.',
    title: 'La ruleta está\ndecidiendo…',
  },
  location: {
    currentFallback: (countryCode: string) =>
      `Ubicación actual · ${countryCode}`,
    searching: 'Buscando ubicación…',
    unavailable: 'Ubicación no disponible',
  },
  photo: {
    authorFallback: 'Autor de la foto',
    authorPrefix: 'Foto de',
    preparing: 'Preparando tu elección…',
    source: 'Ver fuente de la foto',
    unavailable: 'No hay foto disponible',
  },
  price: {
    expensive: '$$$',
    free: 'Gratis',
    inexpensive: '$',
    moderate: '$$',
    veryExpensive: '$$$$',
  },
  radius: {
    options: ['1 km', '3 km', '5 km', '10 km'],
    title: '¿Qué tan lejos?',
  },
  result: {
    attributionPrefix: 'Resultados de',
    distanceKilometers: (value: string) => `${value} km`,
    distanceMeters: (value: number) => `${value} m`,
    selected: 'La ruleta eligió',
  },
} as const;

export const LOCATION_ERROR_MESSAGES = {
  countryLookupTimedOut: 'Location country lookup timed out',
  countryUnavailable: 'Location country could not be determined',
  requestTimedOut: 'Location request timed out',
  warning: 'No fue posible obtener la ubicación.',
} as const;
