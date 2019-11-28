<!-- Window for adding a new contact -->
<template>
	<div class="add-contact">
		<!-- Close button -->
		<div class="close row middle-xs">
			<div class="col-xs start-xs">
				Add Contact
			</div>
			<div class="col-xs end-xs" @click="hideWindow">
				X
			</div>
		</div>

		<!-- New contact form -->
		<div style="margin: 10px 10px">
			Show this code to the other user:
		</div>
		<qriously :value="personalCode" :size="177"></qriously>

		<div style="margin: 10px">
			<div id="qr-window" :class="[contactCode == '' ? 'red-border' : 'green-border']" style="margin-bottom: 20px">
				<qrcode-stream @decode="onQRDecode"></qrcode-stream>
			</div>

			<input type="text" v-model="contactName" style="margin: 20px 5px 10px" placeholder="Contact name" :class="[contactName == '' ? 'red-border' : 'green-border']" />
			<button @click="addContact">Add Contact</button>
		</div>
	</div>
</template>

<script>
import { get, set } from 'idb-keyval'

export default {
	data() {
		return {
			contactName: '', // the display name you set for your new contact
			contactCode: '', // their code, in the format of TheirID_TheirPublicKeyFragment
			personalCode:
				this.$store.state.credentials.id + '_' + this.generatePublic(), // your code
		}
	},
	methods: {
		// Closes this window
		hideWindow() {
			this.$store.state.addContactVisible = false
		},
		// Adds new contact if the form was filled in
		addContact() {
			if (this.contactName.length == 0) return
			if (!this.contactCode.includes('_')) return

			// Gets id and generates encryption key out of the key fragment of the contact
			let id = this.contactCode.split('_')[0]
			let key = this.generateShared(this.contactCode.split('_')[1])

			let contact = { name: this.contactName, key: key }

			// Adds contact and new empty chat to vuex
			this.$set(this.$store.state.contacts, id, contact)
			this.$set(this.$store.state.chats, id, [])

			// Stores contact and new empty chat to idb
			set('contacts', this.$store.state.contacts).then(() => {
				console.log('contact created...')
				set('chats', this.$store.state.chats).then(() => {
					console.log('chat created.')
				})
			})

			this.hideWindow()
		},
		// Generates a public key fragment out of your secret
		generatePublic() {
			return this.dh(
				'3',
				this.$store.state.credentials.secret,
				this.$store.state.publicMod
			)
		},
		// Generates a shared encryption key out of their public key fragment
		generateShared(publicKey) {
			return this.dh(
				publicKey,
				this.$store.state.credentials.secret,
				this.$store.state.publicMod
			)
		},
		// A modPow method for the Diffie Hellman exchange
		dh(base, exponent, modulo) {
			let b = this.$bigInt(base) // small prime number
			let e = this.$bigInt(exponent) // private secret, big prime number
			let m = this.$bigInt(modulo) // big prime number
			// base^exponent % modulo = res
			return b.modPow(e, m).toString()
		},
		// Method that decodes the QR code
		onQRDecode(decodedString) {
			console.log(`QR code reads: ${decodedString}`)
			// Write the string to the contact code field so it can be used
			this.contactCode = decodedString

			//* Split the decoded string up into it's two parts if we want to add automatic adding
			//* of contacts
			// let contact = decodedString.split('_')
			// console.log(contact)
		},
	},
}
</script>

<style scoped>
	.add-contact {
		border-right: 1px gray solid;
		height: 100vh;
		width: 100%;
	}
	.close {
		height: 50px;
		border-bottom: 1px solid gray;
		padding: 10px;
		background: lightgray;
		font-weight: bold;
	}
	.red-border {
		border: red 2px solid;
	}
	.green-border {
		border: greenyellow 2px solid;
	}
</style>