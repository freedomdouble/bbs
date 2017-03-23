'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableHighlight,
    Dimensions
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ScreenW = Dimensions.get('window').width;
const cateWidth = ScreenW / 5;

export default class DiscuzCates extends Component {

    constructor(props) {

        super(props);

        this.state = { isDropDown: false };
    }

    render() {

        let catesWraper = [];

        this.props.cates.forEach((item, i) => {

            if (this.state.isDropDown == false) {
                if (i < 9) {
                    catesWraper.push(
                        <TouchableHighlight key={i} style={{ width: cateWidth, alignItems: 'center' }} underlayColor='rgba(0,0,0,0.1)'
                            onPress={() => this.props.navigation.navigate('DiscuzPostsList', { id: item.associated_id })}
                        >
                            <View style={{ alignItems: 'center', marginTop: 15 }}>
                                <Image source={{ uri: item.thumb }} style={{ width: 50, height: 50, borderRadius: 8 }} />
                                <Text style={{ fontSize: 10, color: '#222', marginTop: 4 }}>{item.title}</Text>
                            </View>
                        </TouchableHighlight>
                    );
                }
            } else {
                catesWraper.push(
                    <TouchableHighlight key={i} style={{ width: cateWidth, alignItems: 'center' }} underlayColor='rgba(0,0,0,0.1)'
                        onPress={() => this.props.navigation.navigate('DiscuzPostsList', { id: item.associated_id })}
                    >
                        <View style={{ alignItems: 'center', marginTop: 15 }}>
                            <Image source={{ uri: item.thumb }} style={{ width: 50, height: 50, borderRadius: 8 }} />
                            <Text style={{ fontSize: 10, color: '#222', marginTop: 4 }}>{item.title}</Text>
                        </View>
                    </TouchableHighlight>
                );
            }
        });

        return (
            <View style={{
                flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                alignItems: 'flex-start', backgroundColor: '#fff', paddingBottom: 22, paddingTop: 7, marginBottom: 30
            }}>
                {catesWraper}
                <TouchableHighlight style={{ width: cateWidth, alignItems: 'center' }} underlayColor="rgba(0,0,0,0)"
                    onPress={() => { this.setState({ isDropDown: !this.state.isDropDown }) }}>
                    <View style={{ alignItems: 'center', marginTop: 15, justifyContent: 'center', backgroundColor: '#f4f4f4', width: 50, height: 50, borderRadius: 8 }}>
                        {this.state.isDropDown == false ? (<Icon name="chevron-double-down" size={28} color="#ccc" />) : (<Icon name="chevron-double-up" size={28} color="#ccc" />)}
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}