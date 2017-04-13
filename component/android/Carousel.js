'use strict'

import React, { Component } from 'react';
import {
    Text,
    View,
    ViewPagerAndroid,
    Image,
    Dimensions,
    TouchableHighlight
} from 'react-native';

const ScreenW = Dimensions.get('window').width;

export default class Carousel extends Component {

    constructor(props) {

        super(props);

        this.timer = {};
        this.viewPage = {};
        this.listData = this.props.viewData;

        this.state = { currentPage: 0 };
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    componentDidMount() {
        this._setIntervel();
    }

    render() {

        const height = 220;

        if (this.listData.length == 0) {
            return false;
        } else {
            let imageWraper = [];
            let dotWraper = [];

            this.listData.forEach((data, i) => {
                imageWraper.push(
                    <View key={i} style={{ width: ScreenW, height: height }}>
                        <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" onPress={() => {
                            this.props.navigation.navigate('PostsDetail', { id: data.associated_id, callBack: () => { this._setIntervel() } });
                        }}>
                            <Image source={{ uri: data.thumb }} style={{ width: ScreenW, height: height }} />
                        </TouchableHighlight>
                    </View>
                );

                let dotColor = this.state.currentPage === i ? { backgroundColor: '#03c893' } : { backgroundColor: '#fff' };

                dotWraper.push(
                    <View key={i} style={[{ width: 5, height: 5, marginLeft: 3 }, dotColor]}></View>
                );
            });

            return (
                <View style={{ height: height }}>
                    <ViewPagerAndroid
                        ref={viewPager => { this.viewPage = viewPager; }}
                        style={{ width: ScreenW, flex: 1 }}
                        initialPage={0}
                        onTouchStart={() => this._onTouchStart()}
                        onPageScroll={this._onPageScroll}
                        onPageSelected={this._onPageSelected}>
                        {imageWraper}
                    </ViewPagerAndroid>
                    <View style={{ width: ScreenW, height: 38, position: 'absolute', bottom: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: 'rgba(52,52,52,0.3)' }}>
                        <View style={{ flex: 8, alignItems: 'flex-start' }}>
                            <Text style={{ color: '#fff' }}>{this.listData[this.state.currentPage].short_title}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            {dotWraper}
                        </View>
                    </View>
                </View>
            );
        }
    }

    _onTouchStart() {
        clearInterval(this.timer);
    }

    _onPageSelected = (e) => {

        let currentPage = e.nativeEvent.position;

        this.viewPage.setPage(currentPage);

        this.setState({ currentPage: currentPage });

        this._setIntervel();
    }

    _setIntervel() {

        this.timer = setInterval(() => {

            let currentPage;

            if (this.state.currentPage > 0 && (this.state.currentPage + 1 == this.listData.length)) {
                currentPage = 0;
            } else {
                currentPage = this.state.currentPage + 1;
            }

            this.viewPage.setPage(currentPage);

            this.setState({ currentPage: currentPage });

        }, 2000);
    }

}
