import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
import 'flexboxgrid2/flexboxgrid2.min.css'
import VueMq from 'vue-mq'
import VueQriously from 'vue-qriously'
import QrCodeStream from 'vue-qrcode-reader'
import bigInt from 'big-integer'
import randomString from  'randomstring'
import forge from 'node-forge'
import aes from 'aes-js'
import { sha512_256 } from 'js-sha512'
import { get, set } from 'idb-keyval'

Vue.use(VueQriously)
Vue.use(QrCodeStream)
Vue.use(VueResource)
Vue.use(VueMq, {
	breakpoints: {
		sm: 768,
		lg: Infinity
	}
})

Object.defineProperty(Vue.prototype, '$bigInt', { value: bigInt })
Object.defineProperty(Vue.prototype, '$randomString', { value: randomString })
Object.defineProperty(Vue.prototype, '$forge', { value: forge })
Object.defineProperty(Vue.prototype, '$aes', { value: aes })
Object.defineProperty(Vue.prototype, '$sha2', { value: sha512_256 })
Object.defineProperty(Vue.prototype, '$idbGet', { value: get })
Object.defineProperty(Vue.prototype, '$idbSet', { value: set })


Vue.filter('date', function (value) {
	if (!value) return ''
	let months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	]
	let dateString = value.toString().split(' ')[0].replace(/-/g, '/')
	let currentDate = new Date(dateString)
	return (
		months[currentDate.getMonth()] +
		' ' +
		currentDate.getDate() +
		', ' +
		currentDate.getFullYear()
	)
})

Vue.config.productionTip = false

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */
const components = require.context('./components', true, /\.vue$/i)
components.keys().forEach((fileName) => {
	Vue.component(
		fileName.split('/').pop().split('.')[0],
		components(fileName).default || components(fileName)
	)
})

new Vue({
	router,
	store,
	render: function (h) {
		return h(App)
	}
}).$mount('#app')
