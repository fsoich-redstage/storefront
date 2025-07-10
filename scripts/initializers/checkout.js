import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

console.log('eee CHECKOUT INIT: Iniciando Drop-in Checkout');

await initializeDropin(async () => {
  console.log('eee CHECKOUT INIT: Seteando headers de GraphQL');
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  console.log('eee CHECKOUT INIT: Cargando placeholders...');
  const labels = await fetchPlaceholders('placeholders/checkout.json');

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  console.log('eee CHECKOUT INIT: Ejecutando mountImmediately');

  const result = initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('eee CHECKOUT DEBUG: CartModel raw data:', JSON.stringify(data, null, 2));

          const shippingAddresses = Array.isArray(data?.shipping_addresses)
            ? data.shipping_addresses
            : [];

          return {
            availablePaymentMethods: data?.available_payment_methods || [],
            selectedPaymentMethod: data?.selected_payment_method || null,
            availableShippingMethods: shippingAddresses[0]?.available_shipping_methods || [],
            selectedShippingMethod: shippingAddresses[0]?.selected_shipping_method || null,
          };
        },
      },
    },
  });

  if (typeof window !== 'undefined') {
    console.log('eee CHECKOUT INIT: Registrando eventos globales via window');

    window.addEventListener('message', (e) => {
      if (!e?.data?.type?.startsWith('checkout/')) return;
      console.log(`eee GLOBAL EVENT: ${e.data.type} →`, e.data?.payload);
    });
  }

  console.log('eee CHECKOUT INIT: Listo y esperando eventos');
  return result;
});
