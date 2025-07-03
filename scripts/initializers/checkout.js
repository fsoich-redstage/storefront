import { initializeDropin } from './index.js';

await initializeDropin(async () => {
  console.log('[INIT] Starting Drop-in initialization...');

  // ✅ Se importa acá adentro para asegurar orden
  const { initializeConfig, getHeaders } = await import('@dropins/tools/lib/aem/configs.js');
  await initializeConfig();
  console.log('[INIT] Drop-in config initialized');

  const { initializers } = await import('@dropins/tools/initializer.js');
  const { initialize, setFetchGraphQlHeaders } = await import('@dropins/storefront-checkout/api.js');
  const { fetchPlaceholders } = await import('../commerce.js');
  const { events } = await import('@dropins/tools/event-bus.js');
  const { handleCheckoutInitialized, handleCartData } = await import('../events.js');

  // ✅ Headers GraphQL
  setFetchGraphQlHeaders((prev) => {
    const headers = { ...prev, ...getHeaders('checkout') };
    console.log('[INIT] GraphQL headers set:', headers);
    return headers;
  });

  // ✅ Cargar placeholders
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

  // ✅ Montar drop-in
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
});
