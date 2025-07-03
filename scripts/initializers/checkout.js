import { initializeDropin } from './index.js';

await initializeDropin(async () => {
  console.log('🟢 [CHECKOUT INIT] ⏳ Starting Drop-in initialization...');

  // ✅ Paso 1: Inicializar config
  const { initializeConfig, getHeaders } = await import('@dropins/tools/lib/aem/configs.js');
  await initializeConfig();
  console.log('✅ [CHECKOUT INIT] ✔ Config initialized');

  // ✅ Paso 2: Setear headers
  const { initialize, setFetchGraphQlHeaders } = await import('@dropins/storefront-checkout/api.js');
  setFetchGraphQlHeaders((prev) => {
    const headers = { ...prev, ...getHeaders('checkout') };
    console.log('✅ [CHECKOUT INIT] 📡 GraphQL headers set:', headers);
    return headers;
  });

  // ✅ Paso 3: Cargar placeholders
  const { fetchPlaceholders } = await import('../commerce.js');
  const labels = await fetchPlaceholders('placeholders/checkout.json').catch(err => {
    console.error('❌ [CHECKOUT INIT] 🔥 Error loading placeholders:', err);
    return {};
  });
  console.log('✅ [CHECKOUT INIT] 🏷 Placeholders loaded:', labels);

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // ✅ Paso 4: Suscribir eventos
  const { events } = await import('@dropins/tools/event-bus.js');
  const { handleCheckoutInitialized, handleCartData } = await import('../events.js');

  events.on('checkout/initialized', handleCheckoutInitialized, { eager: true });
  console.log('✅ [CHECKOUT INIT] 🧩 Subscribed to event: checkout/initialized');

  events.on('cart/data', handleCartData, { eager: true });
  console.log('✅ [CHECKOUT INIT] 🛒 Subscribed to event: cart/data');

  // ✅ Paso 5: Montar drop-in
  const { initializers } = await import('@dropins/tools/initializer.js');
  const result = initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('🔄 [CHECKOUT INIT] 🔍 Transforming CartModel data:', data);
          return {
            availablePaymentMethods: Array.isArray(data?.available_payment_methods)
              ? data.available_payment_methods
              : [],
            selectedPaymentMethod: data?.selected_payment_method || null,
          };
        },
      },
    },
  });

  console.log('✅ [CHECKOUT INIT] 🎉 Checkout Drop-in successfully initialized!');
  return result;
});
