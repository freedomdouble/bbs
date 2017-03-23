'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableHighlight
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

export default class BottomNav extends Component {

    constructor(props) {

        super(props);
    }

    render() {
        let data = [
            {
                name: 'Index',
                icon: 'ios-analytics-outline',
                text: '首页',
                route: () => {
                    console.log('---------------------');
                    console.log(this.props.nav);
                    console.log('---------------------');
                    this.props.nav.navigate('Index');
                }
            },
            {
                name: 'Discuz',
                icon: 'ios-ionic-outline',
                text: '论坛',
                route: () => {
                    console.log('---------------------');
                    console.log(this.props.nav);
                    console.log('---------------------');
                    //this.props.nav.goBack('Index');
                    this.props.nav.navigate('Discuz');
                }
            },
            {
                name: 'Dynamic',
                icon: 'ios-timer-outline',
                text: '动态',
                route: () => {
                    console.log('---------------------');
                    console.log(this.props.nav);
                    console.log('---------------------');
                    this.props.nav.navigate('Dynamic');
                }
            },
            {
                name: 'Mine',
                icon: 'ios-contact-outline',
                text: '我的',
                route: () => {
                    console.log('---------------------');
                    console.log(this.props.nav);
                    console.log('---------------------');
                    this.props.nav.navigate('Mine');
                }
            }
        ];

        let wraper = [];
        let color = null;

        data.map((d, index) => {
            if (d.name == this.props.name) {
                color = '#03c893';
            }
            else {
                color = '#ccc';
            }
            wraper.push(
                <TouchableHighlight underlayColor="rgba(0,0,0,0)" key={index} onPress={d.route} style={{ flex: 1 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Icon name={d.icon} size={28} color={color} />
                        <Text style={{ fontSize: 10, color: color }}>{d.text}</Text>
                    </View>
                </TouchableHighlight>
            );
        });

        return (
            <View style={{ height: 55, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }}>
                {wraper}
            </View>
        );
    }
}