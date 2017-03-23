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
    ListView,
    ViewPagerAndroid,
    RefreshControl,
    Modal,
    TextInput,
    BackAndroid,
    ActivityIndicator
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import LoadMore from './LoadMore';
import DynamicRow from './DynamicRow';

const ScreenW = Dimensions.get('window').width;

export default class Dynamic extends Component {

    constructor(props) {

        super(props);
        this.submited = false;
        this._viewPage = {};
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.user = null;
        this.newListObject = { page: 1, isPageEnd: false, list: [] };
        this.hotListObject = { page: 1, isPageEnd: false, list: [] };

        this.state = {
            refreshing: true,
            currTabel: 0,
            visible: false,
            wasReplyNickname: '',
            rowId: 0,
            dynamicId: 0,
            newListObject: { dataSource: this.ds.cloneWithRows([]), loadMoreFlag: 0 },
            hotListObject: { dataSource: this.ds.cloneWithRows([]), loadMoreFlag: 0 },
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

    // 更新某一行的数据
    async _updateRowData() {

        let url = 'http://121.11.71.33:8081/api/dynamic/detail?dynamic_id=' + this.state.dynamicId;

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

                this.newListObject.list[this.state.rowId].comments = result.dynamic.comments;
                this.newListObject.list[this.state.rowId].comment_account = result.dynamic.comment_account;
                let list = this.newListObject.list.slice(0);
                let newListObject = this.state.newListObject;
                newListObject.dataSource = this.ds.cloneWithRows(list);
                this.setState({ newListObject: newListObject, visible: !this.state.visible });

                this.hotListObject.list.forEach((l, index) => {
                    if (l.id == this.state.dynamicId) {
                        this.hotListObject.list[index].comments = result.dynamic.comments;
                        this.hotListObject.list[index].comment_account = result.dynamic.comment_account;
                        let hotList = this.hotListObject.list.slice(0);
                        let hotListObject = this.state.hotListObject;
                        hotListObject.dataSource = this.ds.cloneWithRows(hotList);
                        this.setState({ hotListObject: hotListObject });
                        return;
                    }
                });
            }

            if (this.state.currTabel == 1) {
                this.hotListObject.list[this.state.rowId].comments = result.dynamic.comments;
                this.hotListObject.list[this.state.rowId].comment_account = result.dynamic.comment_account;
                let list = this.hotListObject.list.slice(0);
                let hotListObject = this.state.hotListObject;
                hotListObject.dataSource = this.ds.cloneWithRows(list);
                this.setState({ hotListObject: hotListObject, visible: !this.state.visible });

                this.newListObject.list.forEach((l, index) => {
                    if (l.id == this.state.dynamicId) {
                        this.newListObject.list[index].comments = result.dynamic.comments;
                        this.newListObject.list[index].comment_account = result.dynamic.comment_account;
                        let newList = this.newListObject.list.slice(0);
                        let newListObject = this.state.newListObject;
                        newListObject.dataSource = this.ds.cloneWithRows(newList);
                        this.setState({ newListObject: newListObject });
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
            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.newListObject.isPageEnd = true;
            }

            for (var i = 0; i < dataLength; i++) {
                this.newListObject.list.push(result.list[i]);
            }

            this.newListObject.page += 1;

            let newListObject = this.state.newListObject;
            newListObject.dataSource = this.ds.cloneWithRows(this.newListObject.list);
            newListObject.loadMoreFlag = loadMoreFlag;

            this.setState({ refreshing: false, newListObject: newListObject });
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
            this.newListObject.list = [];

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.newListObject.isPageEnd = true;
            }

            let newListObject = this.state.newListObject;
            newListObject.dataSource = this.state.newListObject.dataSource.cloneWithRows([]);
            this.setState({ newListObject: newListObject });

            this.newListObject.list = this.newListObject.list.concat(result.list);
            newListObject.dataSource = this.ds.cloneWithRows(this.newListObject.list);
            newListObject.loadMoreFlag = loadMoreFlag;
            this.setState({ refreshing: false, newListObject: newListObject });

            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
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
            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.hotListObject.isPageEnd = true;
            }

            for (var i = 0; i < dataLength; i++) {
                this.hotListObject.list.push(result.list[i]);
            }

            this.hotListObject.page += 1;

            let hotListObject = this.state.hotListObject;
            hotListObject.dataSource = this.ds.cloneWithRows(this.hotListObject.list);
            hotListObject.loadMoreFlag = loadMoreFlag;

            this.setState({ refreshing: false, hotListObject: hotListObject });
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
            this.hotListObject.list = [];

            let dataLength = result.list.length;
            let loadMoreFlag = 0;

            if (dataLength < 10) {
                loadMoreFlag = 2;
                this.hotListObject.isPageEnd = true;
            }

            let hotListObject = this.state.hotListObject;
            hotListObject.dataSource = this.ds.cloneWithRows([]);
            this.setState({ hotListObject: hotListObject });

            this.hotListObject.list = this.hotListObject.list.concat(result.list);
            hotListObject.dataSource = this.ds.cloneWithRows(this.hotListObject.list);
            hotListObject.loadMoreFlag = loadMoreFlag;
            this.setState({ refreshing: false, hotListObject: hotListObject });

            ToastAndroid.show('刷新成功', ToastAndroid.SHORT);
        }
        if (result.status == -1) {
            ToastAndroid.show(result.msg, ToastAndroid.SHORT);
            this.setState({ refreshing: false });
        }
    }

    _onPressTabel(currTabel) {
        this._viewPage.setPage(currTabel);
        this.setState({ currTabel: currTabel });

        if (currTabel == 0 && this.newListObject.list.length == 0) {
            this._onRefreshNewList();
        }

        if (currTabel == 1 && this.hotListObject.list.length == 0) {
            this._onRefreshHotList();
        }
    }

    _onPageSelected = (e) => {
        this._onPressTabel(e.nativeEvent.position);
    }

    _renderRow(rowData, sectionID, rowID) {

        return <DynamicRow rowData={rowData} user={this.user} rowID={rowID} navigation={this.props.navigation} callback={(wasReplyNickname, dynamic_id, parent_id, rowId) => {
            let dynamic = this.state.dynamic;
            dynamic.dynamic_id = dynamic_id;
            dynamic.parent_id = parent_id;
            this.setState({ dynamic: dynamic, wasReplyNickname: wasReplyNickname, visible: !this.state.visible, dynamicId: dynamic_id, rowId: rowId });
        }} />
    }

    _renderNewList() {

        return (
            <ListView
                refreshControl={
                    <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefreshNewList()} progressBackgroundColor='#eee'
                        colors={['#ffaa66cc', '#ff00ddff']} />
                }
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                enableEmptySections={true}
                renderFooter={() => <LoadMore bgcolor='#fff' loadMoreFlag={this.state.newListObject.loadMoreFlag} />}
                dataSource={this.state.newListObject.dataSource}
                onEndReached={() => {
                    if (this.state.refreshing == false && this.state.newListObject.loadMoreFlag == 0 && this.newListObject.isPageEnd == false) {
                        let newListObject = this.state.newListObject;
                        newListObject.loadMoreFlag = 1;
                        this.setState({ newListObject: newListObject });
                        this._fetchNewListData();
                    }
                }}
                renderRow={this._renderRow.bind(this)}
            />
        );
    }

    _renderHotList() {

        return (
            <ListView
                refreshControl={
                    <RefreshControl enabled={true} refreshing={this.state.refreshing} onRefresh={() => this._onRefreshHotList()} progressBackgroundColor='#eee'
                        colors={['#ffaa66cc', '#ff00ddff']} />
                }
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                enableEmptySections={true}
                renderFooter={() => <LoadMore bgcolor='#fff' loadMoreFlag={this.state.hotListObject.loadMoreFlag} />}
                dataSource={this.state.hotListObject.dataSource}
                onEndReached={() => {
                    if (this.state.refreshing == false && this.state.hotListObject.loadMoreFlag == 0 && this.hotListObject.isPageEnd == false) {
                        let hotListObject = this.state.hotListObject;
                        hotListObject.loadMoreFlag = 1;
                        this.setState({ hotListObject: hotListObject });
                        this._fetchHotListData();
                    }
                }}
                renderRow={this._renderRow.bind(this)}
            />
        );
    }

    render() {

        let body = (
            <View style={{ flex: 1, backgroundColor: '#f4f4f4', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator animating={true} size="large" color="#03c893" />
            </View>
        );

        if (this.newListObject.list.length > 0 || this.hotListObject.list.length > 0) {
            body = (
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
        }

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
                    {/* 底部导航栏 */}
                    {/*<BottomNav name="Dynamic" nav={this.props.navigation} />*/}
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