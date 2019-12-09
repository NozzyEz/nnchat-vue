<!-- Frontpage view, contains chats, current conversation, and the add contact window -->
<template>
    <div>

        <div class="row">
            <transition enter-active-class="animated slideInLeft faster" leave-active-class="animated slideOutLeft faster">
                <div class="col-md-2 col-xs-12 chats" v-if="$store.state.contactsVisible || $mq === 'lg'">
                    <chats />
                </div>
            </transition>

            <div class="col-md-8 col-xs-12 borders">
                <conversation />
            </div>

            <transition enter-active-class="animated slideInRight faster" leave-active-class="animated slideOutRight faster">
                <div class="col-md-2 col-xs-12 add-contact" v-if="$store.state.addContactVisible">
                    <add-contact />
                </div>
            </transition>
        </div>

    </div>
</template>

<script>
    export default {

    }
</script>

<style scoped>
    .borders {
        border-left: 1px solid gray;
        border-right: 1px solid gray;
    }
    @media only screen and (max-width: 767px) {
        .add-contact {
            z-index: 4;
            position: fixed;
            background: white;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
        .chats {
            z-index: 2;
            position: fixed;
            background: white;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
        }
    }
</style>
