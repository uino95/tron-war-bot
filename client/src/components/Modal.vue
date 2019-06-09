<template>
    <v-layout row justify-center>
        <v-dialog v-model="isVisible" max-width="500">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>{{headerTile}}</v-card-title>

                <v-card-text v-if="headerTile != 'Login With Tronlink'">
                    {{bodyTile}}<br/><br/>{{footerTile}}
                </v-card-text>

                <v-card-text v-if="headerTile == 'Login With Tronlink' && this.isLoggedIn()">
                    Already logged in with TronLink <br/><br/>{{footerTile}}
                </v-card-text>

                <v-card-text v-if="headerTile == 'Login With Tronlink' && !this.isLoggedIn()">
                    Please login to your TRONLink wallet. If you do not have TRONLink wallet installed please visit <a
                        href="http://u6.gg/gmc5D"> http://u6.gg/gmc5D</a> and download the chrome extension. (Tron War
                    Bot is only availble using Chrome browser for the time being) <br/><br/>{{footerTile}}
                </v-card-text>

                <v-card-text v-if="headerTile == 'How To Play'">
                    <!--TODO add how to play-->
                </v-card-text>

                <v-card-text v-if="headerTile == 'FAQ'">
                    <!--TODO add faq-->
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="green darken-1" flat="flat" @click.stop="isVisible = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
    export default {
        name: 'Modal',
        props: {
            value: Boolean,
            headerTile: String,
            footerTile: String,
            bodyTile: String
        },

        methods: {
            close() {
                this.isVisible = false;
            },
            isLoggedIn() {
                return window.tronWeb && window.tronWeb.ready
            },
            // async fetchAccount() {
            //     const account = await window.tronWeb.trx.getAccount();
            //     const accountAddress = account.address; // HexString(Ascii)
            //     const accountAddressInBase58 = window.tronWeb.address.fromHex(
            //         accountAddress
            //     ); // Base58

            //     return accountAddressInBase58
            // },
        },
        computed: {
            isVisible: {
                get() {
                    return this.value
                },
                set(value) {
                    this.$emit('input', value)
                }
            }
        },

        data: () => ({
            isVisible: this.props.isModalVisible,
            lorem: "Iusto vitae mollitia ad maiores accusantium ab. Asperiores deleniti est ab magnam recusandae incidunt veniam qui. Qui facilis inventore sequi eum labore voluptas.\n" +
                "\n" +
                "Eum temporibus vero accusantium impedit voluptatibus et doloribus rerum. Cupiditate voluptatem dolores sapiente deserunt eum qui. Culpa et amet natus debitis. Doloremque natus et illum beatae voluptatem. Sed molestiae quisquam ut tempora minus culpa in minima. Aliquid rem tempora autem facere.",
        })
    };
</script>