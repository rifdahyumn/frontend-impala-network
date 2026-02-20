import { Briefcase, Building, Calendar, FileText, Loader2, Mail, MapPin, Phone, User, Users, X, ExternalLink, Award, Globe, CheckCircle, Clock, TrendingUp, Star, Shield, CreditCard, Linkedin, Instagram, Twitter } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent} from "../ui/dialog"
import { useState } from "react"

const ClientDetailModal = ({ isOpen, onClose, client, loading }) => {
    const [activeTab, setActiveTab] = useState('personal')
    
    if (!isOpen) return null

    // eslint-disable-next-line no-unused-vars
    const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
        if (!value) return null
        
        const colors = {
            blue: "bg-blue-50 text-blue-700 border-blue-200",
            green: "bg-green-50 text-green-700 border-green-200",
            purple: "bg-purple-50 text-purple-700 border-purple-200",
            orange: "bg-orange-50 text-orange-700 border-orange-200",
            pink: "bg-pink-50 text-pink-700 border-pink-200",
            indigo: "bg-indigo-50 text-indigo-700 border-indigo-200"
        }

        return (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors[color] || colors.blue}`}>
                <div className="p-2 rounded-lg bg-white/50">
                    <Icon className={`h-4 w-4 text-${color}-600`} />
                </div>
                <div>
                    <p className="text-xs font-medium opacity-75">{label}</p>
                    <p className="text-sm font-bold">{value}</p>
                </div>
            </div>
        )
    }

    // eslint-disable-next-line no-unused-vars
    const InfoRow = ({ icon: Icon, label, value, isLink, badge }) => {
        if (!value) return null

        return (
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group">
                <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-white transition-colors">
                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {label}
                        </span>
                        {badge && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    
                    {isLink ? (
                        <a 
                            href={value.startsWith('http') ? value : `mailto:${value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-800 font-medium hover:text-blue-600 flex items-center gap-1 mt-0.5 group/link"
                        >
                            <span className="break-all">{value}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                    ) : (
                        <p className="text-sm text-gray-800 font-medium mt-0.5 break-words">
                            {value}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    const HeaderSection = () => (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-amber-500 to-rose-600 rounded-t-lg opacity-90" />
            
            <div className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Building className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{client?.company || 'Company Name'}</h2>
                                <p className="text-sm text-white/80 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {client?.full_name || 'Contact Person'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const Tabs = () => (
        <div className="flex gap-1 mb-4 border-b border-gray-200">
            {[
                { id: 'personal', label: 'Personal', icon: User },
                { id: 'company', label: 'Company', icon: Building },
                { id: 'contact', label: 'Contact', icon: Mail },
                { id: 'address', label: 'Address', icon: MapPin }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ${
                        activeTab === tab.id
                            ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    )

    const TabContent = () => {
        switch(activeTab) {
            case 'personal':
                return (
                    <div className="space-y-1">
                        <InfoRow icon={User} label="Full Name" value={client?.full_name} />
                        <InfoRow icon={User} label="Position" value={client?.position} />
                        <InfoRow icon={Users} label="Gender" value={client?.gender === 'male' ? 'Male' : client?.gender === 'female' ? 'Female' : client?.gender} />
                        <InfoRow icon={Calendar} label="Join Date" value={client?.join_date} />
                        <InfoRow icon={FileText} label="Notes" value={client?.notes} />
                    </div>
                )
            case 'company':
                return (
                    <div className="space-y-1">
                        <InfoRow icon={Building} label="Company Name" value={client?.company} badge="Main" />
                        <InfoRow icon={Briefcase} label="Business Type" value={client?.business} />
                        <InfoRow icon={Users} label="Total Employees" value={client?.total_employee} />
                        <InfoRow icon={CreditCard} label="Status" value={client?.status} />
                        <InfoRow icon={Globe} label="Industry" value={client?.business} />
                    </div>
                )
            case 'contact':
                return (
                    <div className="space-y-1">
                        <InfoRow icon={Mail} label="Email" value={client?.email} isLink />
                        <InfoRow icon={Phone} label="Phone" value={client?.phone} />
                    </div>
                )
            case 'address':
                return (
                    <div className="space-y-1">
                        <InfoRow icon={MapPin} label="Province" value={client?.province_name} />
                        <InfoRow icon={MapPin} label="City/Regency" value={client?.regency_name} />
                        <InfoRow icon={MapPin} label="District" value={client?.district_name} />
                        <InfoRow icon={MapPin} label="Village" value={client?.village_name} />
                        <InfoRow icon={MapPin} label="Full Address" value={client?.address} />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <div className="absolute inset-0 animate-pulse bg-blue-100 rounded-full blur-xl opacity-50" />
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Loading client details...</p>
                        <p className="text-xs text-gray-400 mt-1">Please wait a moment</p>
                    </div>
                ) : client ? (
                    <>
                        <HeaderSection />
                        
                        <div className="p-6">
                            <Tabs />
                            
                            <div className="bg-gray-50/50 rounded-lg p-4">
                                <TabContent />
                            </div>

                            {client?.program_name && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <p className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Associated Programs
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        {(() => {
                                            try {
                                                const programs = JSON.parse(client.program_name);
                                                return Array.isArray(programs) ? programs.join(' • ') : client.program_name;
                                            } catch {
                                                return client.program_name;
                                            }
                                        })()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t bg-gray-50 px-6 py-3 flex items-center justify-end">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={onClose}
                                className="hover:bg-gray-200"
                            >
                                Close
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Client Data</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            The client information could not be loaded or is not available.
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onClose}
                            className="mt-4"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ClientDetailModal