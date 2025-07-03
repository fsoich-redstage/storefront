import { initializeConfig, getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';
import { handleCheckoutInitialized, handleCartData } from '../events.js';

console.log('[INIT] Checkout initializer script loaded');

await initializeDropin(async () => {
  console.log('[INIT] Starting Drop-in initialization...');

  // ✅ Inicializar configuración (antes de getHeaders)
  await initializeConfig();
  console.log('[INIT] Drop-in config initialized');

  // ✅ Setear headers GraphQL
  setFetchGraphQlHeaders((prev) => {
    const headers = { ...prev, ...getHeaders('checkout') };
    console.log('[INIT] GraphQL headers set:', headers);
    return headers;
  });

  // ✅ Cargar placeholders de idioma
  const labels = await fetchPlaceholders('placeholders/checkout.json').catch(err => {
    console.error('[INIT] Error loading placeholders:', err);
    return {};
  });
  console.log('[INIT] Placeholders loaded:', labels);

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // ✅ Subscribirse a eventos
  events.on('checkout/initialized', handleCheckoutInitialized, { eager: true });
  console.log('[INIT] Subscribed to checkout/initialized event');

  events.on('cart/data', handleCartData, { eager: true });
  console.log('[INIT] Subscribed to cart/data event');

  // ✅ Mount + extender modelo de cart (OOPE)
  const result = initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('[INIT] Transforming CartModel data:', data);
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
          };
        },
      },
    },
  });

  console.log('[INIT] Checkout drop-in initialized');
  return result;
})();
