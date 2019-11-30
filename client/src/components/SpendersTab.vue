<template>
    <v-container grid-list-md text-xs-center class="outerTabContainer">
        <v-layout row wrap>
        <!-- Top Spenders -->
        <v-flex sm6>
            <v-card>
                <v-toolbar flat color="primary_history_tab">
                    <v-toolbar-title>Top Spenders </v-toolbar-title>
                    <v-spacer />
                    <v-text-field class="pa-2" v-model="searchSpenders" append-icon="search"
                        label="Search for an address" single-line hide-details></v-text-field>
                </v-toolbar>
                <v-toolbar flat color="primary_history_tab">
                    <v-select :items="dates" label="Select the week" :value="dates[0]" @change="setDateSpenders"></v-select>
                </v-toolbar>

                <v-data-table :custom-sort="customSort" :custom-filter="customFilter" :search="searchSpenders"
                    :headers="headers" :items="spenders" :item-key="'address'" class="elevation-1"
                    :pagination.sync="pagination" hide-actions>
                    <template v-slot:items="props" >
                        <td class="title text-xs-left pr-0 pl-2">{{props.index + 1 | index}}</td>
                        <td v-bind:style="{'max-width': ((windowSize.x/12)*5)  + 'px'}" class="text-xs-left pr-2">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <div class="text-truncate" v-on="on" >{{ props.item['.key'] }}</div>
                                </template>
                                <span>{{props.item['.key']}} </span>
                            </v-tooltip>
                        </td>
                        <td class="text-xs-right pl-2">{{props.item['.value'] | TRX}}</td>
                    </template>
                </v-data-table>
            </v-card>
        </v-flex>

        <!--TOP WINNERS -->
        <v-flex sm6>
            <v-card>
                <v-toolbar flat color="primary_history_tab">
                    <v-toolbar-title>Top Winners </v-toolbar-title>
                    <v-spacer />
                    <v-text-field class="pa-2" v-model="searchWinners" append-icon="search"
                        label="Search for an address" single-line hide-details></v-text-field>
                </v-toolbar>
                <v-toolbar flat color="primary_history_tab">
                    <v-select :items="dates" label="Select the week" @change="setDateWinners" :value="dates[0]"></v-select>
                </v-toolbar>

                <v-data-table :custom-sort="customSort" :custom-filter="customFilter" :search="searchWinners"
                    :headers="headers" :items="winners" :item-key="'address'" class="elevation-1"
                    :pagination.sync="pagination" hide-actions>
                    <template v-slot:items="props" >
                        <td class="title text-xs-left pr-0 pl-2">{{props.index + 1 | index}}</td>
                        <td v-bind:style="{'max-width': ((windowSize.x/12)*5)  + 'px'}" class="text-xs-left pr-2">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <div class="text-truncate" v-on="on" >{{ props.item['.key'] }}</div>
                                </template>
                                <span>{{props.item['.key']}} </span>
                            </v-tooltip>
                        </td>
                        <td class="text-xs-right pl-2">{{props.item['.value'] | TRX}}</td>
                    </template>
                </v-data-table>
            </v-card>
        </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    import {
        db
    }
    from '../plugins/firebase';
    import tronweb from 'tronweb'

    export default {
        data: () => ({
            headers: [{
                    text: '',
                    value: 'order',
                    sortable: false,
                    align: 'left',
                    class: 'pa-0 ma-0'
                },
                {
                    text: 'Address',
                    value: 'address',
                    sortable: false,
                    align: 'left',
                    class: 'title pr-2'
                },
                {
                    text: 'Amount',
                    value: 'amount',
                    sortable: false,
                    align: 'right',
                    class: 'title pl-2'
                }
            ],
            pagination: {
                sortBy: 'amount',
                descending: true,
                rowsPerPage: 10,

            },
            searchSpenders: '',
            searchWinners: '',
            limit: 10,
            spenders: [],
            winners: [],
            loaded: false,
            date: null,
            dates: [],
            firstMonday: 1574031600000,
            windowSize: {
                x: window.innerWidth,
                y: window.innerHeight
            },
        }),
        methods: {
            loadDataByDate(path) {
                if (this.date == 'All Time') {
                    this.$rtdbBind(path, db.ref('public/stats/' + path.toUpperCase() + '|FULL').orderByValue().limitToLast(this
                        .limit))
                    return
                }
                this.$rtdbBind(path, db.ref('public/stats/' + path.toUpperCase() + '|' + this.date).orderByValue().limitToLast(this
                    .limit))
            },
            customSort(items, index, isDesc) {
                items.sort((a, b) => {
                    if (!isDesc) {
                        return a['.value'] < b['.value'] ? -1 : 1;
                    } else {
                        return b['.value'] < a['.value'] ? -1 : 1;
                    }
                });
                return items;
            },
            customFilter(items, search) {
                return items.filter((el) => el['.key'].includes(search))
            },
            initDates() {
                let now = Date.now()
                let currentMonday = now - ((new Date(now).getDay() - 1) * 24 * 60 * 60 * 1000)
                this.date = new Date(currentMonday).toISOString().slice(0, 10)
                while (currentMonday >= this.firstMonday) {
                    this.dates.push(new Date(currentMonday).toISOString().slice(0, 10))
                    currentMonday = currentMonday - (7 * 24 * 60 * 60 * 1000)
                }
                this.dates.push('All Time')
            },
            setDateWinners(value) {
                this.date = value
                this.loadDataByDate('winners')
            },
            setDateSpenders(value){
                this.date = value
                this.loadDataByDate('spenders')
            }
        },
        mounted() {
            window.addEventListener('resize', () => {
                this.windowSize.x = window.innerWidth
                this.windowSize.y = window.innerHeight
            })
            this.initDates()
            db.ref('public/stats/SPENDERS|' + this.date).limitToLast(this.limit).once('value',
                snap => {
                    this.$root.$emit('loaded', true);
                })
            this.loadDataByDate('spenders')
            this.loadDataByDate('winners')

        },
        filters: {
            TRX: (amount) => {
                return tronweb.fromSun(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' TRX'
            },
            index: (i) => {
                if (i == 1) return '🥇';
                if (i == 2) return '🥈';
                if (i == 3) return '🥉';
                return i
            }
        }
    }
</script>