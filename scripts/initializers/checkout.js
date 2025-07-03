console.log('[INIT] Drop-in initialized - Fulcrum patch active');
import { initializeDropin } from './index.js';

await initializeDropin(async () => {
  console.log('🟢 [INIT] Checkout Drop-in bootstrap...');

  // Paso 1: cargar config primero
  const configModule = await import('@dropins/tools/lib/aem/configs.js');
  await configModule.initializeConfig();
  console.log('✅ [INIT] Config initialized');

  // Paso 2: importar dependencias después de config
  const { initializers } = await import('@dropins/tools/initializer.js');
  const { initialize, setFetchGraphQlHeaders } = await import('@dropins/storefront-checkout/api.js');
  const { fetchPlaceholders } = await import('../commerce.js');
  const { events } = await import('@dropins/tools/event-bus.js');
  const { handleCheckoutInitialized, handleCartData } = await import('../events.js');

  // Paso 3: setear headers (ya tenemos config disponible)
  const headers = { ...configModule.((await import('@dropins/tools/lib/aem/configs.js')).getHeaders('checkout')) };
  setFetchGraphQlHeaders(() => {
    console.log('✅ [INIT] GraphQL headers set:', headers);
    return headers;
  });

  // Paso 4: placeholders
  const labels = await fetchPlaceholders('placeholders/checkout.json').catch(err => {
    console.error('❌ [INIT] Error loading placeholders:', err);
    return {};
  });
  console.log('✅ [INIT] Labels loaded:', labels);

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // Paso 5: eventos
  events.on('checkout/initialized', handleCheckoutInitialized, { eager: true });
  console.log('✅ [INIT] Event hooked: checkout/initialized');

  events.on('cart/data', handleCartData, { eager: true });
  console.log('✅ [INIT] Event hooked: cart/data');

  // Paso 6: montar checkout
  const result = initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('🔁 [INIT] Transforming CartModel:', data);
          return {
            availablePaymentMethods: data?.available_payment_methods ?? [],
            selectedPaymentMethod: data?.selected_payment_method ?? null,
          };
        },
      },
    },
  });

  console.log('✅ [INIT] Drop-in mounted with success 🚀');
  return result;
});
