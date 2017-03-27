'use strict';

import React, { Component } from 'react';
import {
    AppRegistry,
    Platform,
    StyleSheet
} from 'react-native';
import { StackNavigator, TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/Ionicons';

import Login from './component/android/Login';
import Reg from './component/android/Reg';
import ForgetPassword from './component/android/ForgetPassword';
import Index from './component/android/Index';
import Discuz from './component/android/Discuz';
import DiscuzPostsList from './component/android/DiscuzPostsList';
import PostsPublish from './component/android/PostsPublish';
import PostsDetail from './component/android/PostsDetail';
import PostsComment from './component/android/PostsComment';
import PostsComments from './component/android/PostsComments';
import PostsCommentReplys from './component/android/PostsCommentReplys';
import Dynamic from './component/android/Dynamic';
import DynamicDetail from './component/android/DynamicDetail';
import DynamicPublish from './component/android/DynamicPublish';
import ImageView from './component/android/ImageView';
import Mine from './component/android/Mine';
import MineInfo from './component/android/MineInfo';
import MineInfoMobile from './component/android/MineInfoMobile';
import MineFocus from './component/android/MineFocus';
import MineDynamics from './component/android/MineDynamics';
import MinePosts from './component/android/MinePosts';
import MineSet from './component/android/MineSet';
import MineSetFeedback from './component/android/MineSetFeedback';
import User from './component/android/User';

const BbsTab = TabNavigator(
    {
        Index: { screen: Index },
        Discuz: { screen: Discuz },
        Dynamic: { screen: Dynamic },
        Mine: { screen: Mine },
    },
    {
        initialRouteName: 'Index',
        headerMode: 'none',
        lazyLoad: true,
        swipeEnabled: true,
        mode: Platform.OS == 'ios' ? 'modal' : 'card',
        tabBarPosition: 'bottom',
        animationEnabled: false,
        tabBarOptions: {
            showIcon: true,
            style: { backgroundColor: '#fff', height: 55, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
            labelStyle: { fontSize: 10, marginTop: 2 },
            activeTintColor: '#03c893',
            inactiveTintColor: '#ccc',
            indicatorStyle: { height: 0 }
        }
    }
);

Index.navigationOptions = {
    tabBar: {
        label: '首页',
        icon: ({ tintColor, focused }) => (<Icon name='ios-analytics-outline' size={28} color={focused ? '#03c893' : '#ccc'} />),
    }
};

Discuz.navigationOptions = {
    tabBar: {
        label: '论坛',
        icon: ({ tintColor, focused }) => (<Icon name='ios-ionic-outline' size={28} color={focused ? '#03c893' : '#ccc'} />),
    }
};

Dynamic.navigationOptions = {
    tabBar: {
        label: '动态',
        icon: ({ tintColor, focused }) => (<Icon name='ios-timer-outline' size={28} color={focused ? '#03c893' : '#ccc'} />),
    }
};

Mine.navigationOptions = {
    tabBar: {
        label: '我的',
        icon: ({ tintColor, focused }) => (<Icon name='ios-contact-outline' size={28} color={focused ? '#03c893' : '#ccc'} />),
    }
};

const bbs = StackNavigator({
    Home: { screen: BbsTab },
    Login: { screen: Login },
    Reg: { screen: Reg },
    ForgetPassword: { screen: ForgetPassword },
    DiscuzPostsList: { screen: DiscuzPostsList },
    MineFocus: { screen: MineFocus },
    MineDynamics: { screen: MineDynamics },
    MinePosts: { screen: MinePosts },
    MineInfo: { screen: MineInfo },
    MineInfoMobile: { screen: MineInfoMobile },
    MineSet: { screen: MineSet },
    MineSetFeedback: { screen: MineSetFeedback },
    DynamicDetail: { screen: DynamicDetail },
    DynamicPublish: { screen: DynamicPublish },
    PostsDetail: { screen: PostsDetail },
    PostsPublish: { screen: PostsPublish },
    PostsComment: { screen: PostsComment },
    PostsComments: { screen: PostsComments },
    PostsCommentReplys: { screen: PostsCommentReplys },
    ImageView: { screen: ImageView },
    User: { screen: User },
}, { navigationOptions: { header: { visible: false } } });

AppRegistry.registerComponent('bbs', () => bbs);
