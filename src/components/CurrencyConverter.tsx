import React, { useState, useEffect, useCallback } from 'react';
import { ExchangeRates } from '../../types';
import { Icon } from './Icon';
import LoadingSpinner from './LoadingSpinner';

const CURRENCIES = {
    "AED": "🇦🇪", "AFN": "🇦🇫", "ALL": "🇦🇱", "AMD": "🇦🇲", "ARS": "🇦🇷", "AUD": "🇦🇺", "AZN": "🇦🇿", 
    "BAM": "🇧🇦", "BDT": "🇧🇩", "BGN": "🇧🇬", "BHD": "🇧🇭", "BIF": "🇧🇮", "BND": "🇧🇳", "BOB": "🇧🇴", 
    "BRL": "🇧🇷", "BSD": "🇧🇸", "BWP": "🇧🇼", "BYN": "🇧🇾", "BZD": "🇧🇿", "CAD": "🇨🇦", "CDF": "🇨🇩", 
    "CHF": "🇨🇭", "CLP": "🇨🇱", "CNY": "🇨🇳", "COP": "🇨🇴", "CRC": "🇨🇷", "CVE": "🇨🇻", "CZK": "🇨🇿", 
    "DJF": "🇩🇯", "DKK": "🇩🇰", "DOP": "🇩🇴", "DZD": "🇩🇿", "EGP": "🇪🇬", "ETB": "🇪🇹", "EUR": "🇪🇺", 
    "FJD": "🇫🇯", "GBP": "🇬🇧", "GEL": "🇬🇪", "GHS": "🇬🇭", "GMD": "🇬🇲", "GNF": "🇬🇳", "GTQ": "🇬🇹", 
    "HKD": "🇭🇰", "HNL": "🇭🇳", "HRK": "🇭🇷", "HUF": "🇭🇺", "IDR": "🇮🇩", "ILS": "🇮🇱", "INR": "🇮🇳", 
    "IQD": "🇮🇶", "IRR": "🇮🇷", "ISK": "🇮🇸", "JMD": "🇯🇲", "JOD": "🇯🇴", "JPY": "🇯🇵", "KES": "🇰🇪", 
    "KGS": "🇰🇬", "KHR": "🇰🇭", "KMF": "🇰🇲", "KRW": "🇰🇷", "KWD": "🇰🇼", "KZT": "🇰🇿", "LAK": "🇱🇦", 
    "LBP": "🇱🇧", "LKR": "🇱🇰", "LRD": "🇱🇷", "LSL": "🇱🇸", "LYD": "🇱🇾", "MAD": "🇲🇦", "MDL": "🇲🇩", 
    "MGA": "🇲🇬", "MKD": "🇲🇰", "MMK": "🇲🇲", "MNT": "🇲🇳", "MOP": "🇲🇴", "MRU": "🇲🇷", "MUR": "🇲🇺", 
    "MVR": "🇲🇻", "MWK": "🇲🇼", "MXN": "🇲🇽", "MYR": "🇲🇾", "MZN": "🇲🇿", "NAD": "🇳🇦", "NGN": "🇳🇬", 
    "NIO": "🇳🇮", "NOK": "🇳🇴", "NPR": "🇳🇵", "NZD": "🇳🇿", "OMR": "🇴🇲", "PAB": "🇵🇦", "PEN": "🇵🇪", 
    "PGK": "🇵🇬", "PHP": "🇵🇭", "PKR": "🇵🇰", "PLN": "🇵🇱", "PYG": "🇵🇾", "QAR": "🇶🇦", "RON": "🇷🇴", 
    "RSD": "🇷🇸", "RUB": "🇷🇺", "RWF": "🇷🇼", "SAR": "🇸🇦", "SBD": "🇸🇧", "SCR": "🇸🇨", "SEK": "🇸🇪", 
    "SGD": "🇸🇬", "SLL": "🇸🇱", "SOS": "🇸🇴", "SRD": "🇸🇷", "SSP": "🇸🇸", "STN": "🇸🇹", "SYP": "🇸🇾", 
    "SZL": "🇸🇿", "THB": "🇹🇭", "TJS": "🇹🇯", "TMT": "🇹🇲", "TND": "🇹🇳", "TOP": "🇹🇴", "TRY": "🇹🇷", 
    "TTD": "🇹🇹", "TWD": "🇹🇼", "TZS": "🇹🇿", "UAH": "🇺🇦", "UGX": "🇺🇬", "USD": "🇺🇸", "UYU": "🇺🇾", 
    "UZS": "🇺🇿", "VES": "🇻🇪", "VND": "🇻🇳", "XAF": "🇨🇫", "XOF": "🇧🇯", "XPF": "🇵🇫", "YER": "🇾🇪", 
    "ZAR": "🇿🇦", "ZMW": "🇿🇲"
};

const CURRENCY_SYMBOLS: { [key: string]: string } = {
    "USD": "$", "EUR": "€", "JPY": "¥", "GBP": "£", "AUD": "A$", "CAD": "C$", "CHF": "CHF", "CNY": "¥", "SEK": "kr", "NZD": "NZ$", "MXN": "$", "SGD": "S$", "HKD": "HK$", "NOK": "kr", "KRW": "₩", "TRY": "₺", "RUB": "₽", "INR": "₹", "BRL": "R$", "ZAR": "R", "AED": "د.إ", "AFN": "؋", "ALL": "L", "AMD": "֏", "ARS": "$", "AZN": "₼", "BAM": "KM", "BDT": "৳", "BGN": "лв", "BHD": ".د.ب", "BIF": "FBu", "BND": "$", "BOB": "Bs.", "BSD": "$", "BWP": "P", "BYN": "Br", "BZD": "BZ$", "CDF": "FC", "CLP": "$", "COP": "$", "CRC": "₡", "CVE": "$", "CZK": "Kč", "DJF": "Fdj", "DKK": "kr", "DOP": "RD$", "DZD": "د.ج", "EGP": "E£", "ETB": "Br", "FJD": "$", "GEL": "₾", "GHS": "₵", "GMD": "D", "GNF": "FG", "GTQ": "Q", "HNL": "L", "HRK": "kn", "HUF": "Ft", "IDR": "Rp", "ILS": "₪", "IQD": "ع.د", "IRR": "﷼", "ISK": "kr", "JMD": "J$", "JOD": "JD", "KES": "KSh", "KGS": "с", "KHR": "៛", "KMF": "CF", "KWD": "د.ك", "KZT": "₸", "LAK": "₭", "LBP": "ل.ل", "LKR": "Rs", "LRD": "$", "LSL": "L", "LYD": "ل.د", "MAD": "د.م.", "MDL": "L", "MGA": "Ar", "MKD": "ден", "MMK": "K", "MNT": "₮", "MOP": "P", "MRU": "UM", "MUR": "₨", "MVR": "Rf", "MWK": "MK", "MYR": "RM", "MZN": "MT", "NAD": "$", "NGN": "₦", "NIO": "C$", "NPR": "₨", "OMR": "ر.ع.", "PAB": "B/.", "PEN": "S/", "PGK": "K", "PHP": "₱", "PKR": "₨", "PLN": "zł", "PYG": "₲", "QAR": "ر.ق", "RON": "lei", "RSD": "дин.", "RWF": "RF", "SAR": "ر.س", "SBD": "$", "SCR": "₨", "SLL": "Le", "SOS": "S", "SRD": "$", "SSP": "£", "STN": "Db", "SYP": "£", "SZL": "E", "THB": "฿", "TJS": "ЅМ", "TMT": "m", "TND": "د.ت", "TOP": "T$", "TTD": "TT$", "TWD": "NT$", "TZS": "TSh", "UAH": "₴", "UGX": "USh", "UYU": "$U", "UZS": "сўм", "VES": "Bs.", "VND": "₫", "XAF": "FCFA", "XOF": "CFA", "XPF": "₣", "YER": "﷼", "ZMW": "ZK"
};


const AVAILABLE_CURRENCIES = Object.keys(CURRENCIES).sort();

const CurrencyConverter: React.FC = () => {
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [amount, setAmount] = useState<number | ''>(1);
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchRates = useCallback(async () => {
        setError(null);
        try {
            const response = await fetch('https://api.exchangerate.host/latest');
            if (!response.ok) {
                throw new Error('Network response was not ok. The currency service might be temporarily down.');
            }
            const data = await response.json();
            const fetchedRates = { ...data.rates, EUR: 1 };
            setRates(fetchedRates);
            setLastUpdated(data.date);
            return fetchedRates;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch exchange rates.");
            return null;
        }
    }, []);

    const performConversion = useCallback((currentRates: ExchangeRates | null, currentAmount: number | '', from: string, to: string) => {
        if (!currentRates) return;
        const fromRate = currentRates[from];
        const toRate = currentRates[to];
        const numAmount = typeof currentAmount === 'number' ? currentAmount : 0;
        if (fromRate && toRate) {
            setConvertedAmount(numAmount * (toRate / fromRate));
        }
    }, []);

    useEffect(() => {
        const initialFetch = async () => {
            setIsLoading(true);
            const fetchedRates = await fetchRates();
            if (fetchedRates) {
                performConversion(fetchedRates, 1, 'USD', 'EUR');
            }
            setIsLoading(false);
        };
        initialFetch();
    }, [fetchRates, performConversion]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
    };

    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };
    
    const handleConvert = () => {
        performConversion(rates, amount, fromCurrency, toCurrency);
    };

    const handleRefreshRates = async () => {
        setIsRefreshing(true);
        const fetchedRates = await fetchRates();
        if (fetchedRates) {
            performConversion(fetchedRates, amount, fromCurrency, toCurrency);
        }
        setIsRefreshing(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                <LoadingSpinner />
                <p className="mt-4 text-lg font-semibold text-slate-700">Fetching latest exchange rates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-10 bg-red-50 border-2 border-red-200 rounded-lg min-h-[300px]">
                <Icon name="error" className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-semibold text-red-800">Oops! Something went wrong.</h3>
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
        );
    }
    
    const fromSymbol = CURRENCY_SYMBOLS[fromCurrency] || '';
    const toSymbol = CURRENCY_SYMBOLS[toCurrency] || '';
    const exchangeRateValue = rates && rates[fromCurrency] && rates[toCurrency] ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4) : '';
    const exchangeRateText = exchangeRateValue ? `1 ${fromSymbol} ${fromCurrency} = ${exchangeRateValue} ${toSymbol} ${toCurrency}` : '';

    return (
        <div className="max-w-2xl mx-auto p-2 sm:p-4">
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-slate-800">Currency Converter</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Get up-to-date exchange rates for your travel planning.
                </p>
            </div>
           
            <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
                    {/* "You send" Input + Label */}
                    <div className="w-full">
                        <label htmlFor="from-amount" className="block text-sm font-medium text-slate-700 mb-1">You send</label>
                        <div className="flex">
                            <select
                                id="from-currency"
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className="z-10 inline-flex flex-shrink-0 items-center py-2.5 px-4 text-sm font-medium text-center text-slate-900 bg-slate-100 border border-slate-300 rounded-l-md hover:bg-slate-200 focus:ring-2 focus:outline-none focus:ring-blue-500"
                            >
                                {AVAILABLE_CURRENCIES.map(curr => <option key={curr} value={curr}>{CURRENCIES[curr]} {CURRENCY_SYMBOLS[curr] || ''} {curr}</option>)}
                            </select>
                            <input
                                type="number"
                                id="from-amount"
                                value={amount ?? ''}
                                onChange={handleAmountChange}
                                className="relative w-full rounded-r-md border border-l-0 border-slate-300 bg-slate-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-lg p-2.5 font-semibold"
                                placeholder="0.00"
                                aria-label="Amount to send"
                            />
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex items-center justify-center md:row-start-1 md:col-start-2 transform rotate-90 md:rotate-0">
                        <button
                            onClick={handleSwapCurrencies}
                            className="p-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Swap currencies"
                        >
                            <Icon name="exchange" className="h-5 w-5" />
                        </button>
                    </div>

                    {/* "They receive" Input + Label */}
                    <div className="w-full">
                        <label htmlFor="to-amount" className="block text-sm font-medium text-slate-700 mb-1">They receive</label>
                        <div className="flex">
                            <select
                                id="to-currency"
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                                className="z-10 inline-flex flex-shrink-0 items-center py-2.5 px-4 text-sm font-medium text-center text-slate-900 bg-slate-100 border border-slate-300 rounded-l-md hover:bg-slate-200 focus:ring-2 focus:outline-none focus:ring-blue-500"
                            >
                                {AVAILABLE_CURRENCIES.map(curr => <option key={curr} value={curr}>{CURRENCIES[curr]} {CURRENCY_SYMBOLS[curr] || ''} {curr}</option>)}
                            </select>
                            <input
                                type="text"
                                id="to-amount"
                                value={convertedAmount !== null ? `${toSymbol} ${convertedAmount.toFixed(2)}` : ''}
                                readOnly
                                className="relative w-full rounded-r-md border border-l-0 border-slate-300 bg-slate-200 shadow-sm text-base sm:text-lg p-2.5 font-semibold"
                                placeholder="0.00"
                                aria-label="Amount they receive"
                            />
                        </div>
                    </div>
                    
                    {/* Convert Button */}
                    <div className="md:col-span-3 mt-2">
                        <button
                            onClick={handleConvert}
                            className="w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Icon name="exchange" className="mr-2 -ml-1 h-5 w-5" />
                            Convert
                        </button>
                    </div>

                    {/* Rate Display */}
                    <div className="md:col-span-3 text-center mt-2">
                        <p className="text-base font-semibold text-slate-800">{exchangeRateText}</p>
                        {lastUpdated && 
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <p className="text-xs text-slate-500">
                                    Rates as of: {new Date(lastUpdated).toLocaleDateString()}
                                </p>
                                <button
                                    onClick={handleRefreshRates}
                                    disabled={isRefreshing}
                                    className="w-7 h-7 flex items-center justify-center p-1 rounded-full text-slate-500 hover:bg-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Refresh rates"
                                >
                                    {isRefreshing ? (
                                        <div className="scale-50">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <Icon name="refresh" className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyConverter;