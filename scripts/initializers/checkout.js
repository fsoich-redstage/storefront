import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

await initializeDropin(async () => {
  console.log('[checkout.js] 🚀 Iniciando Drop-in de Checkout... TODO');

  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));
  console.log('[checkout.js] ✅ Headers GraphQL seteados TODO');

  const labels = await fetchPlaceholders('placeholders/checkout.json');
  console.log('[checkout.js] 🪪 Labels cargados TODO', labels);

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  events.on('checkout/initialized', () => {
    console.log('[checkout.js] ✅ Checkout inicializado TODO');
  }, { eager: true });

  events.on('cart/data', (cartData) => {
    console.log('[checkout.js] 🛒 Evento: cart/data TODO', cartData);

    try {
      const shippingMethods = cartData?.shipping_addresses?.[0]?.available_shipping_methods;
      const paymentMethods = cartData?.available_payment_methods;

      console.log('[checkout.js] 💳 Métodos de pago:', paymentMethods, 'TODO');
      console.log('[checkout.js] 🚚 Métodos de envío:', shippingMethods, 'TODO');
    } catch (e) {
      console.log('[checkout.js] ⚠️ Error al parsear métodos de cart.data TODO', e.message);
    }
  }, { eager: true });

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('[checkout.js] 🛠️ CartModel.transformer recibio:', data, 'TODO');
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            availableShippingMethods: data?.shipping_addresses?.[0]?.available_shipping_methods,
            selectedShippingMethod: data?.shipping_addresses?.[0]?.selected_shipping_method,
          };
        },
      },
    },
  });
})();
