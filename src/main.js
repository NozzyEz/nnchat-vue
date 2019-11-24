import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueResource from 'vue-resource'
import 'flexboxgrid2/flexboxgrid2.min.css'
import VueMq from 'vue-mq'
import VueQriously from 'vue-qriously'

Vue.use(VueQriously)
Vue.use(VueResource)
Vue.use(VueMq, {
	breakpoints: {
		sm: 768,
		lg: Infinity
	}
})

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
