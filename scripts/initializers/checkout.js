import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

// Logger con íconos para debug visual
const log = (...args) => console.log('🧩 [checkout.js]', ...args);

// Init del Drop-in
await initializeDropin(async () => {
  log('🟢 initializeDropin START');

  // PASO 2: Setear headers GraphQL
  setFetchGraphQlHeaders((prev) => {
    const merged = { ...prev, ...getHeaders('checkout') };
    log('📬 Headers set for GraphQL:', merged);
    return merged;
  });

  // PASO 3: Cargar placeholders
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  log('📝 Placeholders cargados:', labels);

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // PASO 4: Mount con CartModel extendido para OOPE
  log('🔧 Ejecutando mountImmediately con transformador CartModel');

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          log('🛒 CartModel transformer: raw cart data:', data);
          const result = {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            shippingMethods: data?.shipping_methods,
          };
          log('🔄 CartModel transform result:', result);
          return result;
        },
      },
    },
  });
});

// Eventos para debug
events.on('checkout/initialized', (data) => {
  log('🚀 checkout/initialized:', data);
}, { eager: true });

events.on('cart/data', (data) => {
  log('📦 cart/data:', data);
}, { eager: true });

events.on('checkout/updated', (data) => {
  log('♻️ checkout/updated:', data);
});

events.on('order/placed', (order) => {
  log('✅ order/placed:', order);
});
