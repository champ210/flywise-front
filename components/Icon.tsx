import React from 'react';
import { View } from 'react-native';
import { Svg, Path, Rect, Circle, G } from 'react-native-svg';
import { IconProps } from '../types';

const icons: { [key: string]: React.FC<IconProps> } = {
    'logo': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </Svg>
    ),
    'home': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
        </Svg>
    ),
    'send': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </Svg>
    ),
    'compass': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m-6.44-11.54l1.63 1.63m11.54-3.26L15 7.91m-1.5 6.54L9 12.82m7.63-1.63l-1.63 1.63" />
        </Svg>
    ),
    'chat': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Svg>
    ),
    'planner': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-11.25a.75.75 0 01.75.75v14.25a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75z" />
            <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3v-1.5A2.25 2.25 0 016 0h12a2.25 2.25 0 012.25 2.25v1.5M3.75 3h16.5" />
        </Svg>
    ),
    'grid': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </Svg>
    ),
    'briefcase': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25H5.998a2.25 2.25 0 01-2.25-2.25v-4.098m16.5 0a2.25 2.25 0 00-2.25-2.25h-5.25a2.25 2.25 0 00-2.25 2.25m16.5 0v-2.098a2.25 2.25 0 00-2.25-2.25h-5.25a2.25 2.25 0 00-2.25 2.25v2.098m16.5 0h-2.25M5.998 14.15v-2.098a2.25 2.25 0 012.25-2.25h5.25a2.25 2.25 0 012.25 2.25v2.098m-16.5 0h2.25m12 0h2.25" />
        </Svg>
    ),
    'users': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.928a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m7.5-2.928l-3.75 2.25m3.75-2.25l-3.75-2.25m0 0l-3.75 2.25m3.75-2.25V5.25a3 3 0 00-3-3l-3 1.5m6 0v1.5m6 0a3 3 0 00-3-3l-3 1.5m-6 0V5.25a3 3 0 013-3l3 1.5m0 0l3 1.5m-3-1.5l-3-1.5m0 0l-3 1.5 3 1.5" />
        </Svg>
    ),
    'bookmark': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </Svg>
    ),
    'checklist': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Svg>
    ),
    'clipboard-list': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </Svg>
    ),
    'instagram': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke={props.color} strokeWidth="1.5"/>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" />
        </Svg>
    ),
    'calendar': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
        </Svg>
    ),
    'wallet': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </Svg>
    ),
    'exchange': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </Svg>
    ),
    'passport': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 014.5 3.75h15a.75.75 0 01.75.75v15a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75v-15z" />
            <Path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h7.5m-7.5 3h7.5m-7.5 3h7.5m-7.5 3h7.5" />
        </Svg>
    ),
    'search': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </Svg>
    ),
    'user': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </Svg>
    ),
    'chevron-down': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </Svg>
    ),
    'sparkles': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.455l-1.177-.398 1.177-.398a3.375 3.375 0 002.455-2.455l.398-1.177.398 1.177a3.375 3.375 0 002.455 2.455l1.177.398-1.177.398a3.375 3.375 0 00-2.455 2.455z" />
        </Svg>
    ),
    'x-mark': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </Svg>
    ),
    'flight': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </Svg>
    ),
    'hotel': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m16.5-18v18m-1.5-18h-12a2.25 2.25 0 00-2.25 2.25v15.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25v-15.5a2.25 2.25 0 00-2.25-2.25H6.75m12 0l-3.75-3.75M6.75 3l3.75 3.75m0 0v-3.75m0 3.75h-3.75m3.75 0l-3.75-3.75m9 3.75l-3.75-3.75M9.75 15.75h4.5" />
        </Svg>
    ),
    'car': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.875m-17.25 4.5h16.5M6 12V6.375a3.375 3.375 0 013.375-3.375h.007a3.375 3.375 0 013.375 3.375v5.625" />
        </Svg>
    ),
    'check-circle': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Svg>
    ),
    'trash': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </Svg>
    ),
    'lightbulb': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a6.01 6.01 0 00-3.75 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Svg>
    ),
    'shield': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Svg>
    ),
    'error': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </Svg>
    ),
    'document': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </Svg>
    ),
    'wifi-slash': (props) => (
        <Svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
          <Path strokeLinecap="round" strokeLinejoin="round" d="M3.53 3.53l16.94 16.94m-4.242-4.242a6 6 0 01-8.486-8.486M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </Svg>
    ),
    // ... many other icons would be included here
};

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  if (!name || !icons[name]) {
    // Return a placeholder or null if the icon name is invalid
    return <View {...props} />;
  }
  const IconComponent = icons[name];
  return <IconComponent {...props} />;
};
