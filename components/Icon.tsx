import React from 'react';
import { IconProps } from '../types';

const icons: { [key: string]: React.FC<IconProps> } = {
    'logo': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    'home': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
        </svg>
    ),
    'send': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    'compass': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25L12 12m0 0l-3.75 3.75M12 12L8.25 8.25M12 12l3.75 3.75M12 3v1.5M12 21v-1.5m-8.25-6H4.5m15 0h-1.5" />
        </svg>
    ),
    'chat': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.257c-.245.016-.488.047-.732.094l-3.722.257c-1.134-.093-1.98-1.057-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zM12 6.75v5.25m0 0l-3.75 1.761M12 12l3.75 1.761" />
        </svg>
    ),
    'planner': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
        </svg>
    ),
    'grid': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    'briefcase': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25H5.998a2.25 2.25 0 01-2.25-2.25v-4.098m16.5 0a2.25 2.25 0 00-2.25-2.25h-5.25a2.25 2.25 0 00-2.25 2.25m16.5 0v-2.098a2.25 2.25 0 00-2.25-2.25h-5.25a2.25 2.25 0 00-2.25 2.25v2.098m16.5 0h-2.25M5.998 14.15v-2.098a2.25 2.25 0 012.25-2.25h5.25a2.25 2.25 0 012.25 2.25v2.098m-16.5 0h2.25m12 0h2.25" />
        </svg>
    ),
    'users': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.928a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m7.5-2.928l-3.75 2.25m3.75-2.25l-3.75-2.25m0 0l-3.75 2.25m3.75-2.25V5.25a3 3 0 00-3-3l-3 1.5m6 0v1.5m6 0a3 3 0 00-3-3l-3 1.5m-6 0V5.25a3 3 0 013-3l3 1.5m0 0l3 1.5m-3-1.5l-3-1.5m0 0l-3 1.5 3 1.5" />
        </svg>
    ),
    'bookmark': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
    ),
    'checklist': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'clipboard-list': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    'instagram': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke={props.color || "currentColor"} strokeWidth="1.5"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01" stroke={props.color || "currentColor"}/>
        </svg>
    ),
    'calendar': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
        </svg>
    ),
    'wallet': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
    ),
    'exchange': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
    ),
    'passport': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 014.5 3.75h15a.75.75 0 01.75.75v15a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75v-15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5h7.5m-7.5 3h7.5m-7.5 3h7.5m-7.5 3h7.5" />
        </svg>
    ),
    'search': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    'user': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    'chevron-down': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    ),
    'sparkles': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.573L16.5 21.75l-.398-1.177a3.375 3.375 0 00-2.455-2.455l-1.177-.398 1.177-.398a3.375 3.375 0 002.455-2.455l.398-1.177.398 1.177a3.375 3.375 0 002.455 2.455l1.177.398-1.177.398a3.375 3.375 0 00-2.455 2.455z" />
        </svg>
    ),
    'x-mark': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    'flight': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    'hotel': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m16.5-18v18m-1.5-18h-12a2.25 2.25 0 00-2.25 2.25v15.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25v-15.5a2.25 2.25 0 00-2.25-2.25H6.75m12 0l-3.75-3.75M6.75 3l3.75 3.75m0 0v-3.75m0 3.75h-3.75m3.75 0l-3.75-3.75m9 3.75l-3.75-3.75M9.75 15.75h4.5" />
        </svg>
    ),
    'car': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.875m-17.25 4.5h16.5M6 12V6.375a3.375 3.375 0 013.375-3.375h.007a3.375 3.375 0 013.375 3.375v5.625" />
        </svg>
    ),
    'check-circle': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'trash': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    ),
    'lightbulb': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a6.01 6.01 0 00-3.75 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'shield': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036V21" />
        </svg>
    ),
    'error': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    'document': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    'wifi-slash': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.288 8.288a12.75 12.75 0 0115.904 0M5.106 11.106a7.5 7.5 0 0110.607 0M12 15.75a3 3 0 012.969-2.634" />
        </svg>
    ),
    'fuel': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5h4.875c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H6.75" />
        </svg>
    ),
    'star': (props) => (
        <svg fill="currentColor" viewBox="0 0 20 20" {...props}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
    ),
    'moon': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
    ),
    'refresh': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.185m-3.181-4.992a8.25 8.25 0 00-11.664 0l-3.18 3.185" />
        </svg>
    ),
    'map': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.5V17.5M15 6.5V17.5M3 12h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        </svg>
    ),
    'heart': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    'money': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 015.25 8.25h.75a.75.75 0 01.75.75v.75m0 0H6m-1.5 0H5.25m0 0h.75m0 0h.75m0 0H9m1.5 0H12m0 0h.75m0 0h.75m0 0h.75M13.5 12m-3 0a3 3 0 116 0 3 3 0 01-6 0m-3 0a3 3 0 10-6 0 3 3 0 006 0m13.5 0a3 3 0 100-6 3 3 0 000 6m-3 0a3 3 0 11-6 0 3 3 0 016 0m-3 0a3 3 0 10-6 0 3 3 0 006 0m6 0a3 3 0 100-6 3 3 0 000 6" />
        </svg>
    ),
    'chevron-left': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
    ),
    'chevron-right': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    ),
    'sun': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    'cloud': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.087-5.492 4.5 4.5 0 00-9.08-2.122 4.5 4.5 0 00-6.257 4.981z" />
        </svg>
    ),
    'rain': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.1 9 15 9s1.82-.939 2.666-2.636m-3 .025A2.25 2.25 0 0115 5.25v.001" />
        </svg>
    ),
    'snow': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 6.75h.008v.008H12V6.75zm-3.75 3.75h.008v.008H8.25v-.008zm7.5 0h.008v.008h-.008v-.008zm-3.75 3.75h.008v.008H12v-.008z" />
        </svg>
    ),
    'bolt': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    ),
    'plus': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    'eye': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    'movie': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
    ),
    'heart-solid': (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    ),
    'chat-bubble': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.332A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.425v-2.291c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    ),
    'bookmark-solid': (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
    ),
    'dots-horizontal': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
    ),
    'list': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    ),
    'printer': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
        </svg>
    ),
    'visa': (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14.88 15.88l-1.08-5.7h1.74l1.08 5.7zm-4.23-3.03c.5.24.88.54 1.14.9.27.35.4.78.4 1.28 0 .6-.16 1.1-.48 1.48-.32.37-.8.56-1.44.56-.6 0-1.08-.15-1.44-.45l.22-1.3c.3.18.57.28.81.28.22 0 .4-.07.52-.23.12-.15.18-.35.18-.62 0-.2-.06-.38-.18-.52-.12-.14-.3-.24-.54-.34-.24-.1-.53-.22-.87-.36-.55-.22-.97-.5-1.26-.84-.28-.34-.42-.76-.42-1.26 0-.5.15-.93.45-1.28.3-.36.72-.54 1.26-.54.48 0 .88.13 1.2.38l-.2 1.25c-.24-.16-.48-.24-.72-.24-.2 0-.35.07-.46.2-.1.14-.16.3-.16.52 0 .18.05.33.16.45.1.12.28.22.52.32.24.1.53.22.88.36zM24 15.1v-.1L20.3 5.18h-1.8l-3.6 9.82v.1h1.56l.36-.94h3.12l.2 2.76h1.64zm-14.7-9.36h-2.1L5.3 15.88H7.4zm-3.08 0l-1.12 7.5-1.02-7.5H0l2.3 10.7h1.78l3.6-10.7z"/></svg>,
    'mastercard': (props) => <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M10 12a5 5 0 100-10 5 5 0 000 10z" fill="#EB001B"/><path d="M22 12a5 5 0 10-10 0 5 5 0 0010 0z" fill="#F79E1B"/><path d="M16 12a5 5 0 10-10 0 5 5 0 0010 0z" fill="rgba(255, 255, 255, 0.5)"/></svg>,
    'credit-card': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
    'paypal': (props) => <svg viewBox="0 0 24 24" {...props}><path d="M3.333 3.1h7.427c4.61 0 7.427 2.65 7.427 6.463 0 2.268-.99 4.14-2.65 5.267-1.025.7-2.31 1.1-3.784 1.25l-.48 2.87H8.8l.84-5.025h-.15c-1.124 0-2.1-.55-2.6-1.55-.386-.77-.45-1.635-.2-2.52.23-1.02.7-1.84 1.34-2.42.68-.62 1.55-.95 2.52-.95h.6s.38-.02.68-.05c.3-.03.5-.1.5-.1s-1.8-3.3-6.26-3.3z" fill="#003087"/><path d="M12.913 2.5c4.76 0 7.157 2.5 7.157 6.068 0 2.45-1.1 4.385-2.81 5.48-1.06.67-2.37 1.05-3.873 1.17l-.54 3.22H10.5l.89-5.32h-.1c-1.1 0-2.01-.52-2.47-1.46-.35-.73-.41-1.54-.18-2.37.23-.96.67-1.74 1.28-2.28.64-.58 1.48-.9 2.4-.9h.68s.4-.02.72-.05c.32-.03.52-.1.52-.1s-1.72-3.08-6.14-3.08L18.423 2.5h-5.51z" fill="#009cde"/><path d="M18.8 8.013c0 2.23-1.33 3.86-3.37 3.86h-2.1L12.4 17.1h-2.33l2.25-13.43h4.15c2.3 0 3.6 1.3 3.33 3.343zM14 10.3l.7-4.1h-.5c-.9 0-1.6.4-1.9 1.2-.3.8-.2 1.6.2 2.3.4.6 1.1.6 1.5.6z" fill="#253b80"/></svg>,
    'receipt': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
    ),
    'building': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
    ),
    'tiktok': (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.95-6.43-2.8-1.59-1.87-2.36-4.28-2.02-6.52.34-2.26 1.7-4.21 3.55-5.59.87-.64 1.83-1.12 2.82-1.48.06-2.02.02-4.03.01-6.05z" /></svg>
    ),
    'facebook': (props) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}><path d="M12 2.04c-5.5 0-10 4.49-10 10s4.5 10 10 10 10-4.49 10-10S17.5 2.04 12 2.04zm2.4 6.75h-1.6c-.55 0-.6.26-.6.6v.9h2.2l-.28 2.2h-1.92v6.62H10.5V12.5h-1.7V10.3h1.7V9.03c0-1.7 1.04-2.67 2.6-2.67h1.4v2.19z" /></svg>
    ),
    'globe': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 9h17M3.5 15h17M12 3a16.5 16.5 0 00-7.5 18 16.5 16.5 0 0015 0" />
        </svg>
    ),
    'chart-bar': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    'question-mark-circle': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
    ),
    'apps': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    'food': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    'trophy': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 01-4.596-1.928 9.75 9.75 0 010-12.644 9.75 9.75 0 014.596-1.928h9a9.75 9.75 0 014.596 1.928 9.75 9.75 0 010 12.644 9.75 9.75 0 01-4.596 1.928zM8.25 15V9.75m1.5 5.25v-5.25m3 5.25V9.75m1.5 5.25V9.75M9 5.25h6" />
        </svg>
    ),
    'image': (props) => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={props.color || "currentColor"} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    )
};

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  if (!name || !icons[name]) {
    return <div {...props} />;
  }
  const IconComponent = icons[name];
  return <IconComponent name={name} {...props} />;
};
