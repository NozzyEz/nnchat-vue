<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import { get, set } from 'idb-keyval'

export default {
	data() {
		return {
			credentials: {},
			refreshToken: null, //TODO temp
			accessToken: null, //TODO temp
		}
	},
	created() {
		this.getStoredData()

		// this.testDH()

		// this.$http.get(this.$store.state.apiURL + 'messages/').then((response) => {
		//     console.log(response.body)
		// }, error => {
		//     console.log(error)
		// })

		// this.$http.post(this.$store.state.apiURL + 'token/', this.credentials).then((response) => {
		//     if (!response.body.refresh || !response.body.access) {
		//         console.log("tokens not received: ")
		//         console.log(response)
		//     }
		//     else {
		//         this.refreshToken = response.body.refresh
		//         this.accessToken = response.body.access
		//         console.log(this.refreshToken)
		//         console.log(this.accessToken)
		//     }
		// }, error => {
		//     console.log(error)
		// })
	},
	methods: {
		// Gets chats, contacts and credentials from idb. If they don't exist, creates empty ones.
		getStoredData() {
			get('chats').then(val => {
				if (val === undefined) {
					console.log('stored chats not found...')
					set('chats', {}).then(() => {
						console.log('empty chats list created.')
					})
				} else this.$store.state.chats = val
			})
			get('contacts').then(val => {
				if (val === undefined) {
					console.log('stored contacts not found...')
					set('contacts', {}).then(() => {
						console.log('empty contacts list created.')
					})
				} else this.$store.state.contacts = val
			})
			get('credentials').then(val => {
				if (val === undefined) {
					console.log('stored credentials not found...')
					this.generateCredentials()
				} else this.$store.state.credentials = val
			})
		},
		// Generates credentials for the user upon the first time opening the app.
		generateCredentials() {
			let random = require('randomstring')
			let forge = require('node-forge')
			forge.prime.generateProbablePrime(1024, (err, num) => {
				this.credentials = {
					id: random.generate(150), // random string (150 chars)
					password: random.generate(30), // random string (30 chars)
					secret: num.toString(), // large prime for generating encryption keys (1024 bits)
				}

				console.log(this.credentials)

				set('credentials', this.credentials).then(() => {
					console.log('new credentials generated.')
					this.$store.state.credentials = this.credentials
				})
			})
		},

		// Tests the Diffie Hellman exchange, temporary along with dh()
		testDH() {
			// TODO temp
			let priA =
				'133536470678429729982890921262497746529610075498529201302181779419494793420154504185871784032120181747515869580607501446865539228140028697128937031015333393713772007414993331355551826965993353943834302867067538923672352083289290439130824980497504780137298992304094950529785180565145845238951175151854196308959'
			let priB =
				'95830488627750745001334794437944443602729752008349176794695811277850906964699317524245338690578315681398954488228531568834908823260407790373533019110503144712862882110254673403630388886471025496254756166536850843102389719346888395867859689229454790401834976363536373634168281054040880961571694543580066392561'

			let pubA = this.dh('3', priA, this.$store.state.publicMod)
			console.log('pubA: ' + pubA)

			let pubB = this.dh('3', priB, this.$store.state.publicMod)
			console.log('pubB: ' + pubB)

			let shaA = this.dh(pubB, priA, this.$store.state.publicMod)
			console.log('shaA: ' + shaA)

			let shaB = this.dh(pubA, priB, this.$store.state.publicMod)
			console.log('shaB: ' + shaB)
		},
		dh(base, exponent, modulo) {
			// TODO temp
			let bigInt = require('big-integer')
			let b = bigInt(base) // small prime number
			let e = bigInt(exponent) // private secret, big prime number
			let m = bigInt(modulo) // big prime number
			// base^exponent % modulo = res
			return b.modPow(e, m).toString()
		},
	},
}
</script>

<style>
@import './css/animate.min.css';
@import './css/style.css';

#app {
	overflow: hidden;
}
</style>
