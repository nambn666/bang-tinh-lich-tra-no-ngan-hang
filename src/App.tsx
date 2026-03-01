/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  User, 
  FileText, 
  BarChart3, 
  Calculator, 
  Home,
  X,
  Youtube,
  Facebook
} from 'lucide-react';

// --- Components ---

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
    {children}
  </span>
);

const Bullet = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 mb-3 text-ink-light font-medium">
    <CheckCircle2 className="text-accent w-5 h-5 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm hover:shadow-md transition-all"
  >
    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
      <Icon size={24} />
    </div>
    <h4 className="text-xl font-bold mb-3">{title}</h4>
    <p className="text-ink-light text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 border border-black/5 rounded-2xl bg-white overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold hover:bg-gray-50 transition-colors"
      >
        {q}
        <ChevronDown className={`text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-5 text-ink-light text-sm"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Pages ---

const LandingPage = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [slots, setSlots] = useState(5);
  const [toast, setToast] = useState<{ name: string, show: boolean }>({ name: '', show: false });

  const names = ["Anh Tuấn","Chị Lan","Hoàng Nam","Hà My","Thanh Sơn","Thái Sơn","Lan Anh","Anh Tuân","Minh Đức","Quỳnh Anh","Ngọc Anh","Tuấn Anh","Hải Nam","Văn Hưng","Thu Trang","Khánh Linh","Đức Anh","Bảo Long","Mạnh Hùng","Huy Hoàng"];

  useEffect(() => {
    const handleScroll = () => {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      const isFormInView = rect.top < window.innerHeight && rect.bottom > 0;
      const scrollY = window.scrollY;
      setShowSticky(scrollY > 500 && !isFormInView);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const showRandomToast = () => {
      if (localStorage.getItem('toast_disabled')) return;
      const randomName = names[Math.floor(Math.random() * names.length)];
      setToast({ name: randomName, show: true });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.6) showRandomToast();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Configuration
    const mauticUrl = (import.meta as any).env.VITE_MAUTIC_URL || 'https://crm.nambds.vn';
    const formId = (import.meta as any).env.VITE_MAUTIC_FORM_ID || '9';
    const gasUrl = (import.meta as any).env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbx-ugcIdVDiLCQ1UN4dxAEpzgGkRbiK0xLjGpit6Ta5YWNWwEWJG9zRzkIk3MSY8L0PUA/exec'; // Google Apps Script URL

    if (gasUrl) {
      try {
        console.log('Submitting to GAS:', { name, email, formId, gasUrl });
        
        // Create a hidden form to submit to GAS (Most reliable way to avoid CORS issues with GAS)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = gasUrl;
        form.style.display = 'none';
        form.target = 'hidden_iframe';

        const fields = {
          'mauticform[firstname]': name,
          'mauticform[email]': email,
          'mauticform[formId]': formId,
          'mauticform[source]': window.location.hostname,
          'mauticform[return]': ''
        };

        for (const [key, value] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        
        // Wait 2.5 seconds before navigating to ensure the request is fully sent and processed by GAS
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
          navigate('/thank-you');
        }, 2500);

      } catch (error) {
        console.error('GAS submission error:', error);
        setIsSubmitting(false);
        // Fallback to navigation if error occurs
        setTimeout(() => navigate('/thank-you'), 500);
      }
    } else if (mauticUrl) {
      try {
        // Direct submission to Mautic (Fallback)
        const mauticData = new FormData();
        mauticData.append('mauticform[firstname]', name);
        mauticData.append('mauticform[email]', email);
        mauticData.append('mauticform[formId]', formId);
        mauticData.append('mauticform[return]', window.location.href);

        await fetch(`${mauticUrl}/form/submit?formId=${formId}`, {
          method: 'POST',
          body: mauticData,
          mode: 'no-cors',
        });
        
        navigate('/thank-you');
      } catch (error) {
        console.error('Mautic submission error:', error);
        navigate('/thank-you');
      }
    } else {
      // If no URLs configured, just navigate
      navigate('/thank-you');
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hidden iframe for form submission */}
      <iframe name="hidden_iframe" id="hidden_iframe" style={{ display: 'none' }}></iframe>

      {/* Header */}
      <header className="py-6 border-b border-black/5">
        <div className="container mx-auto px-6">
          <div className="text-xl font-bold tracking-tight">
            NGUYỄN NAM <span className="text-accent">BĐS</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-24 bg-[radial-gradient(circle_at_top_right,_#fff9f0,_transparent)]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <Badge>⭐ QUÀ TẶNG CHO NGƯỜI MUA BĐS</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Bảng tính lịch trả nợ ngân hàng: <span className="text-accent">biết ngay</span> mỗi tháng trả bao nhiêu
              </h1>
              <p className="text-lg text-ink-light mb-10 max-w-xl leading-relaxed">
                Rõ lãi suất ưu đãi & sau ưu đãi, ước tính tiền trả tháng, kiểm tra DTI/LTV để chọn phương án vay an toàn.
              </p>
              
              <div className="mb-12">
                <Bullet text="Ước tính tiền trả hàng tháng trong vài phút" />
                <Bullet text="Hiểu rõ ưu đãi vs sau ưu đãi (tránh 'bị bất ngờ')" />
                <Bullet text="Có bảng lịch trả nợ gốc–lãi từng tháng" />
                <Bullet text="Kiểm tra DTI/LTV để vay an toàn" />
              </div>

              <div className="bg-gray-100 p-8 rounded-[32px] border border-black/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-[#107c41] rounded-lg flex items-center justify-center text-white">
                    <FileText size={20} />
                  </div>
                  <span className="font-bold">Bảng Tính Lịch Trả Nợ - Nguyễn Nam BĐS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['💰 Trả tháng', '📊 Gốc - Lãi', '📉 DTI', '🏦 LTV'].map(chip => (
                    <div key={chip} className="bg-white py-2.5 px-4 rounded-xl text-xs font-bold text-center shadow-sm">
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5" ref={formRef}>
              <div className="bg-white p-8 lg:p-10 rounded-[40px] border border-black/5 shadow-2xl relative">
                <div className="bg-[#fff9f0] border border-dashed border-accent rounded-2xl p-5 mb-8">
                  <div className="text-sm line-through opacity-50 mb-1">Giá trị: 1.600.000đ</div>
                  <div className="text-red-600 font-bold text-lg mb-1">🔥 MIỄN PHÍ HÔM NAY</div>
                  <div className="text-sm font-semibold">Form sẽ tạm đóng sau {slots} suất cuối hôm nay.</div>
                </div>

                <h3 className="text-2xl font-bold mb-8">Nhận bảng tính ngay</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-ink-light">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        name="name"
                        required 
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-accent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-ink-light">Email nhận file</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="email" 
                        name="email"
                        required 
                        placeholder="email@gmail.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-accent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <label className="flex gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked required className="mt-1 accent-accent w-4 h-4" />
                    <span className="text-xs text-ink-light leading-snug group-hover:text-ink transition-colors">
                      Tôi đồng ý nhận tài liệu qua email. Có thể hủy bất cứ lúc nào.
                    </span>
                  </label>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-accent hover:bg-accent-dark text-white rounded-2xl font-bold text-lg shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'ĐANG GỬI...' : 'GỬI FILE CHO TÔI'} <ArrowRight size={20} />
                  </button>
                  <div className="text-center text-[10px] text-ink-light font-medium uppercase tracking-widest mt-4">
                    🔒 Bảo mật tuyệt đối • Không spam
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">File này giúp bạn tính những gì?</h2>
            <p className="text-ink-light">Mọi con số bạn cần để ra quyết định vay mua nhà an toàn.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Calculator} 
              title="Tiền trả hàng tháng" 
              desc="Biết chính xác số tiền cần chuẩn bị mỗi tháng (gồm cả gốc và lãi)."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Lịch trả nợ chi tiết" 
              desc="Bảng kê chi tiết dư nợ giảm dần qua từng tháng trong suốt thời gian vay."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Tỷ lệ DTI" 
              desc="Kiểm tra tỷ lệ trả nợ trên thu nhập để đảm bảo không bị áp lực tài chính."
            />
            <FeatureCard 
              icon={Home} 
              title="Tỷ lệ LTV" 
              desc="Tính toán tỷ lệ khoản vay trên giá trị tài sản để biết mức độ đòn bẩy."
            />
          </div>
          <div className="mt-16 text-center font-bold text-accent">
            💡 Bạn chỉ cần nhập: Số tiền vay, Thu nhập, Giá trị tài sản, Thời hạn, Lãi suất...
          </div>
        </div>
      </section>

      {/* Qualification */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-10 rounded-[32px] bg-green-50 border border-green-100">
              <h4 className="text-xl font-bold mb-6 text-green-800 flex items-center gap-2">
                <CheckCircle2 /> Phù hợp nếu:
              </h4>
              <ul className="space-y-4 text-green-900/70 font-medium">
                <li>• Bạn đang cân nhắc mua nhà/đất và muốn biết khoản trả tháng</li>
                <li>• Bạn muốn hiểu rõ ưu đãi/sau ưu đãi trước khi vay</li>
                <li>• Bạn muốn chọn phương án vay an toàn theo thu nhập</li>
              </ul>
            </div>
            <div className="p-10 rounded-[32px] bg-red-50 border border-red-100">
              <h4 className="text-xl font-bold mb-6 text-red-800 flex items-center gap-2">
                <X /> Chưa phù hợp nếu:
              </h4>
              <ul className="space-y-4 text-red-900/70 font-medium">
                <li>• Bạn chỉ xem cho vui, không có nhu cầu tính toán tài chính</li>
                <li>• Bạn không có ý định vay ngân hàng để mua BĐS</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-16 items-center">
            <div className="md:col-span-4">
              <img 
                src="https://i.postimg.cc/GtngZLrM/nam_nho.jpg" 
                alt="Nguyễn Nam BĐS" 
                className="w-full rounded-[40px] shadow-2xl"
              />
            </div>
            <div className="md:col-span-8">
              <Badge>VỀ TÁC GIẢ</Badge>
              <h2 className="text-4xl font-bold mb-6">Tôi là Nguyễn Nam BĐS</h2>
              <p className="text-xl text-ink-light mb-8 leading-relaxed">
                Tôi chia sẻ công cụ tính toán đơn giản này để giúp khách hàng của mình ra quyết định tự tin và đảm bảo an toàn tài chính khi sử dụng đòn bẩy ngân hàng.
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@Nguy%E1%BB%85nNamB%C4%90S" target="_blank" className="w-12 h-12 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                  <Youtube size={20} />
                </a>
                <a href="https://www.facebook.com/nambds.vn/" target="_blank" className="w-12 h-12 rounded-full bg-white border border-black/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
          </div>
          <FAQItem 
            q="File gửi khi nào?" 
            a="Hệ thống sẽ gửi link Google Sheet trực tiếp vào email của bạn ngay sau khi bạn bấm đăng ký thành công." 
          />
          <FAQItem 
            q="Có mất phí không?" 
            a="Hoàn toàn MIỄN PHÍ. Đây là món quà tôi dành tặng cho cộng đồng khách hàng mua BĐS." 
          />
          <FAQItem 
            q="Tôi không rành Excel có dùng được không?" 
            a="Được! File chạy trên Google Sheet, giao diện cực kỳ đơn giản. Bạn chỉ cần nhập các con số vào ô màu vàng, kết quả sẽ tự động hiện ra." 
          />
          <FAQItem 
            q="Nếu không thấy email thì làm gì?" 
            a="Bạn hãy kiểm tra kỹ trong hòm thư chính, tab Quảng cáo (Promotions) hoặc Thư rác (Spam) nhé." 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-ink text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-bold mb-8">
            NGUYỄN NAM <span className="text-accent">BĐS</span>
          </div>
          <p className="text-white/40 text-sm mb-4">© 2026 Nguyễn Nam BĐS. Tất cả quyền được bảo lưu.</p>
          <p className="text-white/20 text-[10px] max-w-md mx-auto uppercase tracking-widest">
            Tài liệu mang tính chất tham khảo, vui lòng kiểm tra lại với ngân hàng giải ngân thực tế.
          </p>
        </div>
      </footer>

      {/* Sticky CTA */}
      <AnimatePresence>
        {showSticky && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-black/5 z-50 md:bottom-8 md:left-auto md:right-8 md:w-auto md:rounded-full md:border md:shadow-2xl md:p-2 md:flex md:items-center md:gap-6"
          >
            <div className="hidden md:block pl-6 text-sm font-bold text-accent">🔥 Miễn phí hôm nay</div>
            <button 
              onClick={scrollToForm}
              className="w-full md:w-auto bg-accent text-white px-8 py-4 rounded-xl md:rounded-full font-bold shadow-lg shadow-accent/20 hover:bg-accent-dark transition-all"
            >
              TẢI VỀ NGAY →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast FOMO */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed bottom-24 left-6 bg-white p-4 rounded-2xl shadow-2xl border border-black/5 flex items-center gap-4 z-[60] max-w-[280px]"
          >
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
              {toast.name.charAt(0)}
            </div>
            <div className="text-xs">
              <div className="font-bold">{toast.name}</div>
              <div className="text-ink-light">vừa nhận bảng tính</div>
              <div className="text-[10px] text-accent font-medium mt-1">vài giây trước</div>
            </div>
            <button onClick={() => {
              setToast(prev => ({ ...prev, show: false }));
              localStorage.setItem('toast_disabled', 'true');
            }} className="absolute top-2 right-2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-red-600 mb-4 uppercase">ĐÃ GỬI EMAIL!</h1>
        <p className="text-xl text-ink-light mb-12 font-medium">Hãy làm theo hướng dẫn bên dưới để nhận bảng tính.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { 
              step: 1, 
              img: "https://i.postimg.cc/brhDktZj/1.png",
              desc: <>Kiểm tra hộp thư <span className="text-red-600">Inbox (Chính)</span></>
            },
            { 
              step: 2, 
              img: "https://i.postimg.cc/Bb0LHKj0/2.png",
              desc: <>Kiểm tra <span className="text-red-600">Thư rác (Spam)</span></>
            },
            { 
              step: 3, 
              img: "https://i.postimg.cc/cCSgwnrj/3.png",
              desc: <>Bấm <span className="text-red-600">"NOT SPAM"</span> để nhận tài liệu</>
            }
          ].map(item => (
            <div key={item.step} className="bg-white p-4 md:p-6 rounded-[40px] border border-black/5 shadow-sm flex flex-col items-center">
              <img 
                src={item.img} 
                alt={`Hướng dẫn bước ${item.step}`} 
                className="w-full rounded-3xl border border-gray-100 shadow-inner mb-6" 
              />
              <p className="text-lg font-bold uppercase tracking-tight leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-[#fff9f0] border border-dashed border-accent p-8 rounded-[32px] text-left mb-12">
            <h4 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
              <CheckCircle2 /> Checklist quan trọng:
            </h4>
            <ul className="space-y-4 text-ink-light font-medium">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                Kiểm tra Inbox hoặc tab Promotions (Quảng cáo).
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                Nếu không thấy, kiểm tra Spam (Thư rác).
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <span className="text-red-600 font-bold">QUAN TRỌNG: Nếu mail nằm trong Spam, hãy mở email và bấm "Báo không phải thư rác" để nhận tài liệu.</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-ink-light mb-8 italic">* Email có thể mất 30s để đến hộp thư của bạn.</p>
          
          <Link to="/" className="inline-flex items-center gap-2 px-10 py-4 bg-ink text-white rounded-full font-bold hover:opacity-90 transition-all">
            ← Quay lại trang chính
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </Router>
  );
}
