'use strict';

import React, { Component } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableHighlight,
    StyleSheet,
    Dimensions,
    AsyncStorage,
    ToastAndroid,
    Animated,
    FlatList,
    ViewPagerAndroid,
    Modal,
    TextInput,
    BackAndroid
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import LoadMore from './LoadMore';
import DynamicRow from './DynamicRow';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const ScreenW = Dimensions.get('window').width;

export default class Dynamic extends Component {

    constructor(props) {

        super(props);
        this.submited = false;
        this._viewPage = {};
        this.user = null;
        this.dynamicId = 0;
        this.rowIndex = 0;
        this.newListObject = { page: 1, isPageEnd: false };
        this.hotListObject = { page: 1, isPageEnd: false };

        this.state = {
            refreshing: true,
            currTabel: 0,
            visible: false,
            wasReplyNickname: '',
            newListData: [],
            hotListData: [],
            newLoadMoreFlag: 0,
            hotLoadMoreFlag: 0,
            dynamic: { content: '', dynamic_id: 0, parent_id: 0 }
        };
    }

    componentWillMount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
        BackAndroid.addEventListener('hardwareBackPress', this._onBackAndroid);
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this._onBackAndroid);
    }

    _onBackAndroid = () => {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            BackAndroid.exitApp();
            return true;
        } else {
            this.lastBackPressed = Date.now();
            ToastAndroid.show('再按一次退出', ToastAndroid.SHORT);
            return true;
        }
    }

    async componentDidMount() {

        try {
            const user = await AsyncStorage.getItem('user');
            if (user !== null) {
                this.user = JSON.parse(user);
            }
        } catch (error) {
            ToastAndroid.show('存储异常', ToastAndroid.SHORT);
        }

        this._fetchNewListData();
    }

    // 提交评论
    async _onPressComment() {

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('content', this.state.dynamic.content);
        data.append('dynamic_id', this.state.dynamic.dynamic_id);
        data.append('parent_id', this.state.dynamic.parent_id);

        const url = 'http://121.11.71.33:8081/api/dynamic/comment';

        console.log(url);

        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.user == null ? null : this.user.token
                },
                body: data
            });
            var result = await response.json();
        } catch (error) {
            this.submited = false;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == -1) {
            this.submited = false;
            return;
        }

        if (result.status == 1) {
            this._updateRowData();
            this.submited = false;
            return;
        }
    }

    // 这里处理点赞操作
    async _onPressLike() {

        if (this.user == null) {
            this.props.navigation.navigate('Login'); return;
        }

        if (this.submited == true) {
            ToastAndroid.show('正在提交...', ToastAndroid.SHORT); return;
        }

        ToastAndroid.show('正在提交...', ToastAndroid.SHORT);

        this.submited = true;

        let data = new FormData();
        data.append('dynamic_id', this.dynamicId);

        const url = 'http://121.11.71.33:8081/api/dynamic/like';

        console.log(url);

        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.user == null ? null : this.user.token
                },
                body: data
            });
            var result = await response.json();
        } catch (error) {
            this.submited = false;
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        ToastAndroid.show(result.msg, ToastAndroid.SHORT);

        if (result.status == -1) {
            this.submited = false;
            return;
        }

        if (result.status == 1) {
            this._updateRowData();
            this.submited = false;
            return;
        }
    }

    // 更新某一行的数据
    async _updateRowData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/detail?dynamic_id=' + this.dynamicId;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            if (this.state.currTabel == 0) {

                let newListData = this.state.newListData;

                newListData[this.rowIndex] = result.dynamic;
                this.setState({ newListData: newListData, visible: false });

                let hotListData = this.state.hotListData;

                this.state.hotListData.forEach((l, index) => {
                    if (l.id == this.dynamicId) {
                        hotListData[index] = result.dynamic;
                        this.setState({ hotListData: hotListData });
                        return;
                    }
                });
            }

            if (this.state.currTabel == 1) {

                let hotListData = this.state.hotListData;
                hotListData[this.rowIndex] = result.dynamic;
                this.setState({ hotListData: hotListData, visible: false });

                let newListData = this.state.newListData;

                this.state.newListData.forEach((l, index) => {
                    if (l.id == this.dynamicId) {
                        newListData[index] = result.dynamic;
                        this.setState({ newListData: newListData });
                        return;
                    }
                });
            }

        }
    }

    // 获取最新动态列表数据
    async _fetchNewListData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=new&page=' + this.newListObject.page;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            this.newListObject.page += 1;

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.newListObject.isPageEnd = true;
            }

            var newListData = this.state.newListData;
            newListData = newListData.concat(result.list);

            this.setState({ refreshing: false, newListData: newListData, newLoadMoreFlag: loadMoreFlag });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    // 下拉刷新最新动态列表数据
    async _onRefreshNewList() {

        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=new&page=1';

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            this.newListObject.isPageEnd = false;
            this.newListObject.page = 2;

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.newListObject.isPageEnd = true;
            }

            this.setState({ refreshing: false, newListData: result.list, newLoadMoreFlag: loadMoreFlag });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    // 获取热门动态列表数据
    async _fetchHotListData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=hot&page=' + this.hotListObject.page;

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {
            this.hotListObject.page += 1;

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.hotListObject.isPageEnd = true;
            }

            let hotListData = this.state.hotListData;
            hotListData = hotListData.concat(result.list);

            this.setState({ refreshing: false, hotListData: hotListData, hotLoadMoreFlag: loadMoreFlag });
        }

        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    // 下拉刷新热门动态列表数据
    async _onRefreshHotList() {

        this.setState({ refreshing: true });

        let url = 'http://121.11.71.33:8081/api/dynamic/list?flag=hot&page=1';

        console.log(url);

        try {
            let response = await fetch(url);
            var result = await response.json();
        } catch (error) {
            this.setState({ refreshing: false });
            ToastAndroid.show('网络错误', ToastAndroid.SHORT);
            return;
        }

        if (result.status == 1) {

            this.hotListObject.isPageEnd = false;
            this.hotListObject.page = 2;

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.hotListObject.isPageEnd = true;
            }

            this.setState({ refreshing: false, hotListData: result.list, hotLoadMoreFlag: loadMoreFlag });
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    _onPressTabel(currTabel) {
        this._viewPage.setPage(currTabel);
        this.setState({ currTabel: currTabel });

        if (currTabel == 0 && this.state.newListData.length == 0) {
            this._onRefreshNewList();
        }

        if (currTabel == 1 && this.state.hotListData.length == 0) {
            this._onRefreshHotList();
        }
    }

    _onPageSelected = (e) => {
        this._onPressTabel(e.nativeEvent.position);
    }

    _renderItem = ({ item, index }) => {

        return (
            <DynamicRow
                rowData={item}
                user={this.user}
                rowIndex={index}
                navigation={this.props.navigation}
                _onPressLike={(dynamicId, rowIndex) => {
                    this.dynamicId = dynamicId;
                    this.rowIndex = rowIndex;
                    this._onPressLike();
                }}
                _onPressReply={(wasReplyNickname, wasReplyCommentId, dynamicId, rowIndex) => {
                    let dynamic = this.state.dynamic;
                    dynamic.dynamic_id = dynamicId;
                    dynamic.parent_id = wasReplyCommentId;
                    this.dynamicId = dynamicId;
                    this.rowIndex = rowIndex;
                    this.setState({ dynamic: dynamic, wasReplyNickname: wasReplyNickname, visible: !this.state.visible });
                }}
            />
        );
    }

    _shouldItemUpdate(prev, next) {
        return prev.item !== next.item;
    }

    _renderNewList() {

        return (
            <AnimatedFlatList
                refreshing={this.state.refreshing}
                data={this.state.newListData}
                debug={false}
                disableVirtualization={true}
                legacyImplementation={false}
                numColumns={1}
                removeClippedSubviews={false}
                renderItem={this._renderItem.bind(this)}
                ListFooterComponent={() => <LoadMore bgcolor='#fff' loadMoreFlag={this.state.newLoadMoreFlag} />}
                onRefresh={this._onRefreshNewList.bind(this)}
                shouldItemUpdate={this._shouldItemUpdate.bind(this)}
                onEndReached={() => {
                    if (this.state.refreshing == false && this.state.newLoadMoreFlag == 0 && this.newListObject.isPageEnd == false) {
                        this.setState({ newLoadMoreFlag: 1 });
                        this._fetchNewListData();
                    }
                }}
            />
        );
    }

    _renderHotList() {

        return (
            <AnimatedFlatList
                refreshing={this.state.refreshing}
                data={this.state.hotListData}
                debug={false}
                disableVirtualization={true}
                legacyImplementation={false}
                numColumns={1}
                removeClippedSubviews={false}
                renderItem={this._renderItem.bind(this)}
                ListFooterComponent={() => <LoadMore bgcolor='#fff' loadMoreFlag={this.state.hotLoadMoreFlag} />}
                onRefresh={this._onRefreshHotList.bind(this)}
                shouldItemUpdate={this._shouldItemUpdate.bind(this)}
                onEndReached={() => {
                    if (this.state.refreshing == false && this.state.hotLoadMoreFlag == 0 && this.hotListObject.isPageEnd == false) {
                        this.setState({ hotLoadMoreFlag: 1 });
                        this._fetchHotListData();
                    }
                }}
            />
        );
    }

    render() {

        let body = (
            <View style={{ flex: 1 }}>
                <ViewPagerAndroid
                    ref={viewPager => { this._viewPage = viewPager; }}
                    style={{ width: ScreenW, flex: 1 }}
                    initialPage={0}
                    onPageSelected={this._onPageSelected}>
                    {/*最新列表*/}
                    <View style={{ width: ScreenW, flex: 1, backgroundColor: '#fff' }}>
                        {this._renderNewList()}
                    </View>
                    {/*\最新列表*/}
                    {/*热门列表*/}
                    <View style={{ width: ScreenW, flex: 1, backgroundColor: '#fff' }}>
                        {this._renderHotList()}
                    </View>
                    {/*\热门列表*/}
                </ViewPagerAndroid >
            </View>
        );

        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    {/*状态栏*/}
                    <StatusBar backgroundColor="#03c893" hidden={false} translucent={false} />
                    {/*导航栏*/}
                    <View style={{ flexDirection: 'row', height: 45, backgroundColor: '#03c893' }}>
                        <View style={{ flex: 1 }} />
                        {/*tab 导航栏*/}
                        <View style={{ flex: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                            <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => this._onPressTabel(0)}>
                                <Text style={{ fontSize: this.state.currTabel == 0 ? 16 : 14, color: '#fff', paddingHorizontal: 9 }}>最新</Text>
                            </TouchableHighlight>
                            <TouchableHighlight underlayColor="rgba(0,0,0,0)" onPress={() => this._onPressTabel(1)}>
                                <Text style={{ fontSize: this.state.currTabel == 1 ? 16 : 14, color: '#fff', paddingHorizontal: 9 }}>热门</Text>
                            </TouchableHighlight>
                        </View>
                        {/*\tab 导航栏*/}
                        <TouchableHighlight underlayColor="rgba(0,0,0,0.1)" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                            if (this.user == null) {
                                this.props.navigation.navigate('Login');
                                return;
                            }
                            this.props.navigation.navigate('DynamicPublish');
                        }}>
                            <Icon name="ios-camera-outline" size={28} color="#fff" />
                        </TouchableHighlight>
                    </View>
                    {/*\导航栏*/}
                    {body}
                </View>
                {/* 评论模态框 */}
                <Modal transparent={true} ref="modal" visible={this.state.visible} onRequestClose={() => this.setState({ visible: !this.state.visible })}>
                    <StatusBar backgroundColor="#000" />
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        <View style={{ flexDirection: 'row', backgroundColor: '#fff', width: ScreenW, zIndex: 1000, position: 'absolute', bottom: 0 }}>
                            <TextInput
                                style={{ flex: 1, height: 55, paddingHorizontal: 12 }}
                                placeholderTextColor="#ccc"
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholder={this.state.wasReplyNickname == '' ? '请输入评论内容' : this.state.wasReplyNickname}
                                autoFocus={true}
                                multiline={true}
                                secureTextEntry={false}
                                onChangeText={(text) => {
                                    let dynamic = this.state.dynamic;
                                    dynamic.content = text;
                                    this.setState({ dynamic: dynamic });
                                }}
                            />
                            <TouchableHighlight style={{ alignItems: 'center', height: 55, justifyContent: 'center', backgroundColor: '#03c893', paddingHorizontal: 12 }}
                                onPress={() => this._onPressComment()} underlayColor="rgba(0,0,0,0.1)">
                                <Text style={{ color: '#fff', fontSize: 16 }}>确定</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}