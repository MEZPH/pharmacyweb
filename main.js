

        // --- إعدادات Google Apps Script ---
        // تأكد أن هذا الرابط هو نفس رابط السكريبت الذي يدعم الاستعلام
        const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxgC3-Np9-xTvuc1CnZ86-L0WTsPYbjqX1wuYMaUGJEYT5MdL-O-9b50dBO4F01wvXg/exec";
        
        // دالة لتحويل الأرقام للغة العربية
        function toArabicDigits(str) {
            return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
        }

        // دالة للحصول على اسم اليوم بالعربي
        function getArabicDayName(date) {
            const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
            return days[date.getDay()];
        }

        // دالة للحصول على الوقت بتنسيق 12 ساعة وأرقام عربية
        function getArabicTime(date) {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return toArabicDigits(`${hours}:${minutes.toString().padStart(2,'0')} ${ampm}`);
        }

        // دالة للحصول على التاريخ أرقام عربية
        function getArabicDate(date) {
            const y = date.getFullYear();
            const m = (date.getMonth()+1).toString().padStart(2,'0');
            const d = date.getDate().toString().padStart(2,'0');
            return toArabicDigits(`${y}/${m}/${d}`);
        }

        // عناصر الصفحة
        const mainMenu = document.getElementById('mainMenu');
        const prescriptionForm = document.getElementById('prescriptionForm');
        const reviewSection = document.getElementById('reviewSection');
        const reviewData = document.getElementById('reviewData');
        const inquireSection = document.getElementById('inquireSection');
        const inquireForm = document.getElementById('inquireForm');
        const inquireResult = document.getElementById('inquireResult');
        const loadingMessage = document.getElementById('loadingMessage');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        const addAnotherBtn = document.getElementById('addAnotherBtn');
        const finishBtn = document.getElementById('finishBtn');

        // عناصر النموذج
        const customerName = document.getElementById('customerName');
        const insuranceId = document.getElementById('insuranceId');
        const mobileNumber = document.getElementById('mobileNumber');
        const diagnosis = document.getElementById('diagnosis');
        const prescriptionType = document.getElementById('prescriptionType');
        const attachments = document.getElementById('attachments');
        // رسائل الخطأ
        const nameError = document.getElementById('nameError');
        const idError = document.getElementById('idError');
        const mobileError = document.getElementById('mobileError');
        const diagnosisError = document.getElementById('diagnosisError');
        const inquireCode = document.getElementById('inquireCode');
        const inquireCodeError = document.getElementById('inquireCodeError');

        // متغيرات لتخزين بيانات العميل عند إدخال روشتة أخرى
        let lockedName = "";
        let lockedId = "";
        let lockedMobile = "";

        // --- عرض وإخفاء الأقسام ---
        function showSection(section) {
            mainMenu.style.display = section === 'main' ? 'block' : 'none';
            prescriptionForm.style.display = section === 'form' ? 'block' : 'none';
            reviewSection.style.display = section === 'review' ? 'block' : 'none';
            inquireSection.style.display = section === 'inquire' ? 'block' : 'none';
            anotherPrescriptionSection.style.display = section === 'another' ? 'block' : 'none';
            anotherFormSection.style.display = section === 'anotherForm' ? 'block' : 'none';
            loadingMessage.style.display = 'none';
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            // إذا عاد العميل للرئيسية، أفرغ جميع الحقول والملفات وأخفي قسم رفع الملفات والزر
            if (section === 'main') {
                prescriptionForm.reset();
                customerName.value = '';
                insuranceId.value = '';
                mobileNumber.value = '';
                diagnosis.value = '';
                prescriptionType.value = '';
                attachments.value = 'لا يوجد مرفقات';
                attachments.disabled = true;
                attachmentsNote.style.display = 'none';
                nameError.style.display = 'none';
                idError.style.display = 'none';
                mobileError.style.display = 'none';
                diagnosisError.style.display = 'none';
                prescriptionTypeError && (prescriptionTypeError.style.display = 'none');
                attachmentsError && (attachmentsError.style.display = 'none');
                // ملفات الروشتة الأولى
                var fileInput = document.getElementById('fileInput');
                if (fileInput) fileInput.value = '';
                var selectedFiles = document.getElementById('selectedFiles');
                if (selectedFiles) selectedFiles.textContent = '';
                var fileUploadStatus = document.getElementById('fileUploadStatus');
                if (fileUploadStatus) fileUploadStatus.textContent = '';
                // أخفي قسم رفع الملفات وزر اختيار الملفات
                showFileUploadSection(false);
                // ملفات الروشتة الأخرى
                var anotherFileInput = document.getElementById('anotherFileInput');
                if (anotherFileInput) anotherFileInput.value = '';
                var anotherSelectedFiles = document.getElementById('anotherSelectedFiles');
                if (anotherSelectedFiles) anotherSelectedFiles.textContent = '';
                var anotherFileUploadStatus = document.getElementById('anotherFileUploadStatus');
                if (anotherFileUploadStatus) anotherFileUploadStatus.textContent = '';
            }
        }

        // --- تحقق من صحة البيانات ---
        function validateName() {
            const val = customerName.value.trim();
            const words = val.split(' ').filter(w => w.length > 0);
            const isValid = words.length >= 3 && /^[\u0600-\u06FF\s]+$/.test(val);
            nameError.style.display = isValid ? 'none' : 'block';
            customerName.style.borderColor = isValid ? '#ccc' : 'var(--error)';
            return isValid;
        }
        function validateId() {
            const val = insuranceId.value.trim();
            const isValid = /^\d{8}$/.test(val);
            idError.style.display = isValid ? 'none' : 'block';
            insuranceId.style.borderColor = isValid ? '#ccc' : 'var(--error)';
            return isValid;
        }
        function validateMobile() {
            const val = mobileNumber.value.trim();
            const isValid = /^01\d{9}$/.test(val);
            mobileError.style.display = isValid ? 'none' : 'block';
            mobileNumber.style.borderColor = isValid ? '#ccc' : 'var(--error)';
            return isValid;
        }
        function validateDiagnosis() {
            const isValid = diagnosis.value !== '';
            diagnosisError.style.display = isValid ? 'none' : 'block';
            diagnosis.style.borderColor = isValid ? '#ccc' : 'var(--error)';
            return isValid;
        }
        function validatePrescriptionType() {
            const isValid = prescriptionType.value !== '';
            prescriptionTypeError.style.display = isValid ? 'none' : 'block';
            prescriptionType.style.borderColor = isValid ? '#ccc' : 'var(--error)';
            return isValid;
        }
        function validateAttachments() {
            if (attachments.disabled) return true;
            const isMorfakat = attachments.value !== '' && attachments.value !== 'لا يوجد مرفقات';
            const fileInput = document.getElementById('fileInput');
            let valid = true;
            if (isMorfakat) {
                valid = fileInput && fileInput.files && fileInput.files.length > 0;
            }
            attachmentsError.style.display = valid ? 'none' : 'block';
            attachments.style.borderColor = valid ? '#ccc' : 'var(--error)';
            return valid;
        }
        function validateForm() {
            return validateName() & validateId() & validateMobile() & validateDiagnosis() & validatePrescriptionType() & validateAttachments();
        }
        customerName.addEventListener('input', validateName);
        insuranceId.addEventListener('input', validateId);
        mobileNumber.addEventListener('input', validateMobile);
        diagnosis.addEventListener('input', validateDiagnosis);
        prescriptionType.addEventListener('change', function() {
            if (prescriptionType.value === 'علاج شهري') {
                attachments.value = "لا يوجد مرفقات";
                attachments.disabled = true;
            } else if (prescriptionType.value === 'روشتة عادية') {
                attachments.disabled = false;
            } else {
                attachments.disabled = true;
                attachments.value = "لا يوجد مرفقات";
            }
            validatePrescriptionType();
            validateAttachments();
        });
        attachments.addEventListener('change', function() {
            let msg = '';
            // إظهار واجهة رفع الملف عند أي مرفق (تحاليل أو تقارير أو تحاليل وتقارير)
            if (attachments.value === "تحاليل" || attachments.value === "تقارير" || attachments.value === "تحاليل وتقارير") {
                msg = "يمكنك رفع صورة أو ملف (PDF, Word, أو أي ملف) مباشرة هنا";
                showFileUploadSection(true);
            } else {
                showFileUploadSection(false);
            }
            if (msg) {
                attachmentsNote.textContent = msg;
                attachmentsNote.style.display = 'block';
            } else {
                attachmentsNote.style.display = 'none';
            }
            validateAttachments();
        });

        // قسم رفع الملف (يظهر فقط عند اختيار "تحاليل")
        // إضافة العنصر ديناميكياً أسفل المرفقات
        const fileUploadDiv = document.createElement('div');
        fileUploadDiv.id = 'fileUploadSection';
        fileUploadDiv.style.display = 'none';
        fileUploadDiv.style.marginTop = '10px';
        fileUploadDiv.innerHTML = `
            <label for="fileInput" style="display:block;font-weight:700;color:var(--primary-dark);margin-bottom:7px;">ارفع المرفقات (يمكنك اختيار أكثر من ملف):</label>
            <div style="position:relative;width:100%;margin-bottom:8px;">
                <input type="file" id="fileInput" accept="*/*" multiple style="opacity:0;width:100%;height:48px;position:absolute;right:0;top:0;z-index:2;cursor:pointer;">
                <button type="button" id="customFileBtn" style="width:100%;height:48px;background:#f8fafc;color:#232946;font-weight:700;border:1.5px solid #e0e7ef;border-radius:12px;font-size:1.13rem;box-shadow:var(--input-shadow);text-align:center;cursor:pointer;z-index:1;position:relative;">اختر الملفات</button>
                <span id="selectedFiles" style="display:block;margin-top:6px;font-size:0.98rem;color:var(--primary-dark);font-weight:700;text-align:right;"></span>
            </div>
            <span id="fileUploadStatus" style="display:block;margin-top:6px;font-weight:700;"></span>
        `;
        // أضف العنصر بعد قائمة المرفقات
        attachments.parentNode.appendChild(fileUploadDiv);

        function showFileUploadSection(show) {
            fileUploadDiv.style.display = show ? 'block' : 'none';
            // إظهار زر اختيار الملفات فقط إذا كان show=true
            var customFileBtn = document.getElementById('customFileBtn');
            if (customFileBtn) {
                customFileBtn.style.display = show ? 'block' : 'none';
            }
        }

        // زر اختيار الملفات المخصص
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'customFileBtn') {
                document.getElementById('fileInput').click();
            }
        });

        // عرض أسماء الملفات المختارة
        document.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'fileInput') {
                var files = e.target.files;
                var names = [];
                for (var i = 0; i < files.length; i++) {
                    names.push(files[i].name);
                }
                document.getElementById('selectedFiles').textContent = names.length ? 'الملفات المختارة: ' + names.join('، ') : '';
            }
        });


        // رفع الملفات تلقائياً بعد حفظ البيانات
        async function uploadFilesAuto(customerName, attachmentsType, callback) {
            var fileInput = document.getElementById('fileInput');
            var files = fileInput && fileInput.files ? Array.from(fileInput.files) : [];
            var statusSpan = document.getElementById('fileUploadStatus');
            if (!files.length) {
                if (statusSpan) statusSpan.textContent = '';
                if (callback) callback();
                return;
            }
            if (statusSpan) {
                statusSpan.textContent = 'جاري رفع الملفات...';
                statusSpan.style.color = '#1976d2';
            }
            let uploaded = 0;
            let links = [];
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                await new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = function(ev) {
                        var base64Data = ev.target.result.split(',')[1];
                        var formData = new FormData();
                        formData.append('fileName', file.name);
                        formData.append('fileData', base64Data);
                        formData.append('mimeType', file.type);
                        formData.append('customerName', customerName);
                        formData.append('attachmentsType', attachmentsType);
                        fetch(SCRIPT_URL, {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            uploaded++;
                            if (data.result === 'success') {
                                links.push('<a href="' + data.fileUrl + '" target="_blank" style="color:var(--primary);text-decoration:underline;">' + file.name + '</a>');
                            } else {
                                links.push('<span style="color:var(--error);">' + file.name + ' (فشل الرفع)</span>');
                            }
                            resolve();
                        })
                        .catch(err => {
                            uploaded++;
                            links.push('<span style="color:var(--error);">' + file.name + ' (خطأ في الاتصال)</span>');
                            resolve();
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
            if (statusSpan) {
                statusSpan.innerHTML = 'تم رفع الملفات: <br>' + links.join('<br>');
                statusSpan.style.color = 'var(--success)';
            }
            if (callback) callback();
        }

        // قسم رفع الملف للروشتة الأولى (موجود كما هو)
        // --- قسم رفع الملفات للروشتة الأخرى (another prescription) ---
        // إضافة عنصر رفع الملفات ديناميكياً أسفل قائمة المرفقات في نموذج الروشتة الأخرى
        const anotherAttachmentsSelect = document.getElementById('anotherAttachments');
        const anotherAttachmentsParent = anotherAttachmentsSelect.parentNode;

        // إنشاء عنصر رفع الملفات للروشتة الأخرى
        const anotherFileUploadDiv = document.createElement('div');
        anotherFileUploadDiv.id = 'anotherFileUploadSection';
        anotherFileUploadDiv.style.display = 'none';
        anotherFileUploadDiv.style.marginTop = '10px';
        anotherFileUploadDiv.innerHTML = `
            <label for="anotherFileInput" style="display:block;font-weight:700;color:var(--primary-dark);margin-bottom:7px;">ارفع المرفقات (يمكنك اختيار أكثر من ملف):</label>
            <div style="position:relative;width:100%;margin-bottom:8px;">
                <input type="file" id="anotherFileInput" accept="*/*" multiple style="opacity:0;width:100%;height:48px;position:absolute;right:0;top:0;z-index:2;cursor:pointer;">
                <button type="button" id="anotherCustomFileBtn" style="width:100%;height:48px;background:#f8fafc;color:#232946;font-weight:700;border:1.5px solid #e0e7ef;border-radius:12px;font-size:1.13rem;box-shadow:var(--input-shadow);text-align:center;cursor:pointer;z-index:1;position:relative;">اختر الملفات</button>
                <span id="anotherSelectedFiles" style="display:block;margin-top:6px;font-size:0.98rem;color:var(--primary-dark);font-weight:700;text-align:right;"></span>
            </div>
            <span id="anotherFileUploadStatus" style="display:block;margin-top:6px;font-weight:700;"></span>
        `;
        // أضف العنصر بعد قائمة المرفقات
        anotherAttachmentsParent.appendChild(anotherFileUploadDiv);

        // دالة إظهار/إخفاء قسم رفع الملفات للروشتة الأخرى
        function showAnotherFileUploadSection(show) {
            anotherFileUploadDiv.style.display = show ? 'block' : 'none';
        }

        // عند تغيير قيمة المرفقات في الروشتة الأخرى
        anotherAttachmentsSelect.addEventListener('change', function() {
            if (
                anotherAttachmentsSelect.value === "تحاليل" ||
                anotherAttachmentsSelect.value === "تقارير" ||
                anotherAttachmentsSelect.value === "تحاليل وتقارير"
            ) {
                showAnotherFileUploadSection(true);
            } else {
                showAnotherFileUploadSection(false);
                var anotherFileInput = document.getElementById('anotherFileInput');
                if (anotherFileInput) anotherFileInput.value = "";
                var anotherSelectedFiles = document.getElementById('anotherSelectedFiles');
                if (anotherSelectedFiles) anotherSelectedFiles.textContent = "";
                var anotherFileUploadStatus = document.getElementById('anotherFileUploadStatus');
                if (anotherFileUploadStatus) anotherFileUploadStatus.textContent = "";
            }
            validateAnotherAttachments();
        });

        // زر اختيار الملفات المخصص للروشتة الأخرى
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'anotherCustomFileBtn') {
                document.getElementById('anotherFileInput').click();
            }
        });

        // عرض أسماء الملفات المختارة للروشتة الأخرى
        document.addEventListener('change', function(e) {
            if (e.target && e.target.id === 'anotherFileInput') {
                var files = e.target.files;
                var names = [];
                for (var i = 0; i < files.length; i++) {
                    names.push(files[i].name);
                }
                document.getElementById('anotherSelectedFiles').textContent = names.length ? 'الملفات المختارة: ' + names.join('، ') : '';
            }
        });

        // دالة رفع ملفات الروشتة الأخرى فقط
        async function uploadAnotherFilesAuto(customerName, attachmentsType, callback) {
            var fileInput = document.getElementById('anotherFileInput');
            var files = fileInput && fileInput.files ? Array.from(fileInput.files) : [];
            var statusSpan = document.getElementById('anotherFileUploadStatus');
            if (!files.length) {
                if (statusSpan) statusSpan.textContent = '';
                if (callback) callback();
                return;
            }
            if (statusSpan) {
                statusSpan.textContent = 'جاري رفع الملفات...';
                statusSpan.style.color = '#1976d2';
            }
            let uploaded = 0;
            let links = [];
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                await new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onload = function(ev) {
                        var base64Data = ev.target.result.split(',')[1];
                        var formData = new FormData();
                        formData.append('fileName', file.name);
                        formData.append('fileData', base64Data);
                        formData.append('mimeType', file.type);
                        formData.append('customerName', customerName);
                        formData.append('attachmentsType', attachmentsType);
                        fetch(SCRIPT_URL, {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            uploaded++;
                            if (data.result === 'success') {
                                links.push('<a href="' + data.fileUrl + '" target="_blank" style="color:var(--primary);text-decoration:underline;">' + file.name + '</a>');
                            } else {
                                links.push('<span style="color:var(--error);">' + file.name + ' (فشل الرفع)</span>');
                            }
                            resolve();
                        })
                        .catch(err => {
                            uploaded++;
                            links.push('<span style="color:var(--error);">' + file.name + ' (خطأ في الاتصال)</span>');
                            resolve();
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
            if (statusSpan) {
                statusSpan.innerHTML = 'تم رفع الملفات: <br>' + links.join('<br>');
                statusSpan.style.color = 'var(--success)';
            }
            if (callback) callback();
        }

        // --- الصفحة الرئيسية ---
        document.getElementById('sendPrescriptionBtn').onclick = () => {
            prescriptionForm.reset();
            showSection('form');
        };
        document.getElementById('inquireBtn').onclick = () => {
            inquireForm.reset();
            inquireResult.style.display = 'none';
            showSection('inquire');
        };

        // --- إلغاء ---
        document.getElementById('cancelFormBtn').onclick = () => showSection('main');
        document.getElementById('cancelInquireBtn').onclick = () => showSection('main');

        // --- مراجعة البيانات ---
        document.getElementById('reviewBtn').onclick = function() {
            if (!validateForm()) return;
            reviewData.innerHTML =
                `<label>اسم العميل:</label><div class="value">${customerName.value}</div>
                <label>رقم الكود التأميني:</label><div class="value">${insuranceId.value}</div>
                <label>رقم الموبايل:</label><div class="value">${mobileNumber.value}</div>
                <label>التخصص:</label><div class="value">${diagnosis.value}</div>
                <label>نوع الصرف:</label><div class="value">${prescriptionType.value}</div>
                <label>المرفقات:</label><div class="value">${attachments.value}</div>
                <div style="margin-top:10px;color:#888;font-size:0.98rem;">هل تريد تعديل أي من هذه البيانات؟</div>`;
            showSection('review');
        };

        // --- تعديل البيانات ---
        document.getElementById('editBtn').onclick = function() {
            showSection('form');
        };

        // --- حفظ البيانات مع رفع المرفقات تلقائياً ---
        document.getElementById('saveBtn').onclick = async function() {
            loadingMessage.style.display = 'block';
            reviewSection.style.display = 'none';
            const now = new Date();
            const data = {
                date: getArabicDate(now),
                time: getArabicTime(now),
                day: getArabicDayName(now),
                customerName: customerName.value.trim(),
                insuranceId: "'" + insuranceId.value.trim(),
                mobileNumber: "'" + mobileNumber.value.trim(),
                diagnosis: diagnosis.value,
                prescriptionType: prescriptionType.value, // نوع الصرف
                status: "", // الحالة
                rejectReason: "", // سبب الرفض
                attachments: attachments.value // المرفقات
                // الرقم المميز يتم توليده في السكريبت
            };
            // ترتيب الحقول حسب المطلوب
            const ordered = [
                ['date', data.date],
                ['time', data.time],
                ['day', data.day],
                ['customerName', data.customerName],
                ['insuranceId', data.insuranceId],
                ['mobileNumber', data.mobileNumber],
                ['diagnosis', data.diagnosis],
                ['prescriptionType', data.prescriptionType],
                ['status', data.status],
                ['rejectReason', data.rejectReason],
                ['attachments', data.attachments]
            ];
            try {
                const res = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: ordered.map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&')
                });
                let result = {};
                let rawText = await res.text();
                try {
                    result = JSON.parse(rawText);
                } catch {}
                if (result.result === 'success') {
                    // بعد نجاح حفظ البيانات، ارفع المرفقات تلقائياً
                    await uploadFilesAuto(data.customerName, data.attachments, function() {
                        loadingMessage.style.display = 'none';
                        showSection('another');
                    });
                } else {
                    loadingMessage.style.display = 'none';
                    errorMessage.innerHTML = 'حدث خطأ أثناء حفظ البيانات!<br><span style="font-size:0.95em;color:#b00;">' + (result.error || rawText || 'لا يوجد تفاصيل') + '</span>';
                    errorMessage.style.display = 'block';
                }
            } catch (err) {
                loadingMessage.style.display = 'none';
                errorMessage.innerHTML = 'حدث خطأ أثناء حفظ البيانات!<br><span style="font-size:0.95em;color:#b00;">' + (err.message || err || 'لا يوجد تفاصيل') + '</span>';
                errorMessage.style.display = 'block';
            }
        };

        // عند الضغط على "نعم" لإدخال روشتة أخرى
        addAnotherBtn.onclick = function() {
            lockedName = customerName.value;
            lockedId = insuranceId.value;
            lockedMobile = mobileNumber.value;
            document.getElementById('lockedCustomerName').textContent = lockedName;
            document.getElementById('lockedInsuranceId').textContent = lockedId;
            document.getElementById('lockedMobileNumber').textContent = lockedMobile;
            document.getElementById('anotherDiagnosis').value = "";
            document.getElementById('anotherPrescriptionType').value = "";
            document.getElementById('anotherAttachments').value = "لا يوجد مرفقات";
            document.getElementById('anotherDiagnosis').disabled = false;
            document.getElementById('anotherPrescriptionType').disabled = false;
            document.getElementById('anotherAttachments').disabled = true;
            showAnotherFileUploadSection(false);
            // إعادة تعيين ملفات المرفقات للروشتة الأخرى
            var anotherFileInput = document.getElementById('anotherFileInput');
            if (anotherFileInput) anotherFileInput.value = "";
            var anotherSelectedFiles = document.getElementById('anotherSelectedFiles');
            if (anotherSelectedFiles) anotherSelectedFiles.textContent = "";
            var anotherFileUploadStatus = document.getElementById('anotherFileUploadStatus');
            if (anotherFileUploadStatus) anotherFileUploadStatus.textContent = "";
            document.getElementById('anotherDiagnosisError').style.display = 'none';
            document.getElementById('anotherPrescriptionTypeError').style.display = 'none';
            document.getElementById('anotherAttachmentsError').style.display = 'none';
            showSection('anotherForm');
        };

        // تفعيل أو تعطيل المرفقات حسب نوع الروشتة في الروشتة الأخرى
        anotherPrescriptionType.addEventListener('change', function() {
            if (anotherPrescriptionType.value === 'علاج شهري') {
                anotherAttachments.value = "لا يوجد مرفقات";
                anotherAttachments.disabled = true;
                showAnotherFileUploadSection(false);
                var anotherFileInput = document.getElementById('anotherFileInput');
                if (anotherFileInput) anotherFileInput.value = "";
                var anotherSelectedFiles = document.getElementById('anotherSelectedFiles');
                if (anotherSelectedFiles) anotherSelectedFiles.textContent = "";
                var anotherFileUploadStatus = document.getElementById('anotherFileUploadStatus');
                if (anotherFileUploadStatus) anotherFileUploadStatus.textContent = "";
            } else if (anotherPrescriptionType.value === 'روشتة عادية') {
                anotherAttachments.disabled = false;
            } else {
                anotherAttachments.disabled = true;
                anotherAttachments.value = "لا يوجد مرفقات";
                showAnotherFileUploadSection(false);
                var anotherFileInput = document.getElementById('anotherFileInput');
                if (anotherFileInput) anotherFileInput.value = "";
                var anotherSelectedFiles = document.getElementById('anotherSelectedFiles');
                if (anotherSelectedFiles) anotherSelectedFiles.textContent = "";
                var anotherFileUploadStatus = document.getElementById('anotherFileUploadStatus');
                if (anotherFileUploadStatus) anotherFileUploadStatus.textContent = "";
            }
        });

        // عند تغيير قيمة المرفقات في الروشتة الأخرى
        anotherAttachmentsSelect.addEventListener('change', function() {
            if (
                anotherAttachmentsSelect.value === "تحاليل" ||
                anotherAttachmentsSelect.value === "تقارير" ||
                anotherAttachmentsSelect.value === "تحاليل وتقارير"
            ) {
                showAnotherFileUploadSection(true);
            } else {
                showAnotherFileUploadSection(false);
                var anotherFileInput = document.getElementById('anotherFileInput');
                if (anotherFileInput) anotherFileInput.value = "";
                var anotherSelectedFiles = document.getElementById('anotherSelectedFiles');
                if (anotherSelectedFiles) anotherSelectedFiles.textContent = "";
                var anotherFileUploadStatus = document.getElementById('anotherFileUploadStatus');
                if (anotherFileUploadStatus) anotherFileUploadStatus.textContent = "";
            }
            validateAnotherAttachments();
        });

        // --- حفظ البيانات للروشتة الأخرى مع رفع المرفقات تلقائياً ---
        document.getElementById('saveAnotherBtn').onclick = async function() {
            if (!validateAnotherForm()) return;
            loadingMessage.style.display = 'block';
            anotherFormSection.style.display = 'none';
            const now = new Date();
            const data = {
                date: getArabicDate(now),
                time: getArabicTime(now),
                day: getArabicDayName(now),
                customerName: lockedName.trim(),
                insuranceId: "'" + lockedId.trim(),
                mobileNumber: "'" + lockedMobile.trim(),
                diagnosis: document.getElementById('anotherDiagnosis').value,
                prescriptionType: document.getElementById('anotherPrescriptionType').value,
                status: "",
                rejectReason: "",
                attachments: document.getElementById('anotherAttachments').value
            };
            // ترتيب الحقول حسب المطلوب
            const ordered = [
                ['date', data.date],
                ['time', data.time],
                ['day', data.day],
                ['customerName', data.customerName],
                ['insuranceId', data.insuranceId],
                ['mobileNumber', data.mobileNumber],
                ['diagnosis', data.diagnosis],
                ['prescriptionType', data.prescriptionType],
                ['status', data.status],
                ['rejectReason', data.rejectReason],
                ['attachments', data.attachments]
            ];
            try {
                const res = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: ordered.map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&')
                });
                let result = {};
                let rawText = await res.text();
                try {
                    result = JSON.parse(rawText);
                } catch {}
                if (result.result === 'success') {
                    // بعد نجاح حفظ البيانات، ارفع فقط الملفات الجديدة الخاصة بالروشتة الأخرى
                    await uploadAnotherFilesAuto(data.customerName, data.attachments, function() {
                        loadingMessage.style.display = 'none';
                        showSection('another');
                    });
                } else {
                    loadingMessage.style.display = 'none';
                    errorMessage.innerHTML = 'حدث خطأ أثناء حفظ البيانات!<br><span style="font-size:0.95em;color:#b00;">' + (result.error || rawText || 'لا يوجد تفاصيل') + '</span>';
                    errorMessage.style.display = 'block';
                }
            } catch (err) {
                loadingMessage.style.display = 'none';
                errorMessage.innerHTML = 'حدث خطأ أثناء حفظ البيانات!<br><span style="font-size:0.95em;color:#b00;">' + (err.message || err || 'لا يوجد تفاصيل') + '</span>';
                errorMessage.style.display = 'block';
            }
        };

        // زر إلغاء في قسم إدخال روشتة أخرى
        document.getElementById('cancelAnotherBtn').onclick = function() {
            showSection('another');
        };

        // --- الاستعلام عن الروشتة ---
        inquireForm.onsubmit = function(e) {
            e.preventDefault();
            let code = inquireCode.value.trim();
            const isValid = /^\d{8}$/.test(code);
            inquireCodeError.style.display = isValid ? 'none' : 'block';
            inquireCode.style.borderColor = isValid ? '#ccc' : 'var(--error)';
            if (!isValid) return;
            loadingMessage.style.display = 'block';
            inquireResult.style.display = 'none';
            fetch(`${SCRIPT_URL}?action=getAll&insuranceId=${encodeURIComponent(code)}`)
                .then(res => res.json())
                .then(data => {
                    loadingMessage.style.display = 'none';
                    if (data && data.result === 'success' && data.rows && data.rows.length > 0) {
                        const rows = data.rows;
                        // استخراج بيانات العميل من أول صف
                        const row = rows[0];
                        let html = `
<div class="data-view">
    <label>اسم العميل:</label><div class="value">${row[3]}</div>
    <label>رقم الكود التأميني:</label><div class="value">${row[4]}</div>
    <label>رقم الموبايل:</label><div class="value">${row[5]}</div>
</div>
<h3 style="color:var(--primary);margin:18px 0 10px 0;">تفاصيل الطلبات</h3>
<div style="overflow-x:auto;">
<table style="width:100%;border-collapse:collapse;text-align:center;background:#f6faff;border-radius:12px;">
    <thead>
        <tr style="background:#e0e7ef;">
            <th style="padding:8px;">م</th>
            <th style="padding:8px;">التخصص</th>
            <th style="padding:8px;">نوع الصرف</th>
            <th style="padding:8px;">الحالة</th>
            <th style="padding:8px;">سبب الرفض</th>
        </tr>
    </thead>
    <tbody>
`;
                        html += rows.map((r, idx) => {
                            const diagnosis = r[6] ? r[6] : '';
                            const prescriptionType = r[7] ? r[7] : '';
                            const status = r[8] ? r[8].trim() : '';
                            const rejectReason = r[9] ? r[9].trim() : '';
                            // ألوان الحالة وسبب الرفض
                            let statusColor = '';
                            let rejectColor = '';
                            if (status === 'موافقة') {
                                statusColor = 'color:#43a047;font-weight:700;';
                                rejectColor = (rejectReason === 'لا يوجد') ? 'color:#43a047;font-weight:700;' : '';
                            } else if (status === 'مرفوضة' || status === 'معلقة') {
                                statusColor = 'color:var(--error);font-weight:700;';
                                rejectColor = 'color:var(--error);font-weight:700;';
                            } else {
                                statusColor = 'color:#1976d2;font-weight:700;';
                                rejectColor = (rejectReason === 'لا يوجد') ? 'color:#1976d2;font-weight:700;' : '';
                            }
                            if (rejectReason === 'مرفوضة' || rejectReason === 'معلقة') {
                                rejectColor = 'color:var(--error);font-weight:700;';
                            }
                            return `<tr>
            <td style="padding:7px;">${idx + 1}</td>
            <td style="padding:7px;">${diagnosis}</td>
            <td style="padding:7px;">${prescriptionType}</td>
            <td style="padding:7px;${statusColor}">
                ${status ? status : 'قيد المراجعة'}
            </td>
            <td style="padding:7px;${rejectColor}">
                ${rejectReason ? rejectReason : '-'}
            </td>
        </tr>`;
                        }).join('');
                        html += `</tbody></table></div>`;
                        inquireResult.innerHTML = html;
                        inquireResult.style.display = 'block';
                    } else {
                        inquireResult.innerHTML = '<div style="color:var(--error);font-weight:700;">لم يتم العثور على بيانات لهذا الكود.</div>';
                        inquireResult.style.display = 'block';
                    }
                })
                .catch(() => {
                    loadingMessage.style.display = 'none';
                    inquireResult.innerHTML = '<div style="color:var(--error);font-weight:700;">حدث خطأ أثناء البحث.</div>';
                    inquireResult.style.display = 'block';
                });
        };

        // عند الضغط على "لا" للانتهاء
        finishBtn.onclick = function() {
            // عرض رسالة النجاح ثم العودة للرئيسية بعد ثانيتين
            showSection('none');
            successMessage.style.display = 'block';
            setTimeout(() => {
                showSection('main');
            }, 2000);
        };

        // عند الضغط على زر العودة للرئيسية في رسالة النجاح
        backToHomeBtn.onclick = function() {
            showSection('main');
        };

        // ترتيب الحقول في نموذج الروشتة الرئيسي
const prescriptionFields = [
    customerName,
    insuranceId,
    mobileNumber,
    diagnosis,
    prescriptionType,
    attachments
];

// ترتيب الحقول في نموذج الروشتة الأخرى
const anotherFields = [
    document.getElementById('anotherDiagnosis'),
    document.getElementById('anotherPrescriptionType'),
    document.getElementById('anotherAttachments')
];

// دوال التحقق لنموذج الروشتة الأخرى
function validateAnotherDiagnosis() {
    const anotherDiagnosis = document.getElementById('anotherDiagnosis');
    const anotherDiagnosisError = document.getElementById('anotherDiagnosisError');
    const isValid = anotherDiagnosis.value !== '';
    anotherDiagnosisError.style.display = isValid ? 'none' : 'block';
    anotherDiagnosis.style.borderColor = isValid ? '#ccc' : 'var(--error)';
    return isValid;
}
function validateAnotherPrescriptionType() {
    const anotherPrescriptionType = document.getElementById('anotherPrescriptionType');
    const anotherPrescriptionTypeError = document.getElementById('anotherPrescriptionTypeError');
    const isValid = anotherPrescriptionType.value !== '';
    anotherPrescriptionTypeError.style.display = isValid ? 'none' : 'block';
    anotherPrescriptionType.style.borderColor = isValid ? '#ccc' : 'var(--error)';
    return isValid;
}
function validateAnotherAttachments() {
    const anotherAttachments = document.getElementById('anotherAttachments');
    const anotherAttachmentsError = document.getElementById('anotherAttachmentsError');
    if (anotherAttachments.disabled) return true;
    const isMorfakat = anotherAttachments.value !== '' && anotherAttachments.value !== 'لا يوجد مرفقات';
    const fileInput = document.getElementById('anotherFileInput');
    let valid = true;
    if (isMorfakat) {
        valid = fileInput && fileInput.files && fileInput.files.length > 0;
    }
    anotherAttachmentsError.style.display = valid ? 'none' : 'block';
    anotherAttachments.style.borderColor = valid ? '#ccc' : 'var(--error)';
    return valid;
}
function validateAnotherForm() {
    return validateAnotherDiagnosis() & validateAnotherPrescriptionType() & validateAnotherAttachments();
}

document.getElementById('anotherDiagnosis').addEventListener('input', validateAnotherDiagnosis);
document.getElementById('anotherPrescriptionType').addEventListener('change', validateAnotherPrescriptionType);
document.getElementById('anotherAttachments').addEventListener('change', validateAnotherAttachments);

// دالة التنقل عند الضغط على ENTER
function enableEnterNavigation(fields, saveBtnId) {
    fields.forEach((field, idx) => {
        field.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (idx < fields.length - 1) {
                    // انتقل للحقل التالي
                    fields[idx + 1].focus();
                } else if (saveBtnId) {
                    // عند آخر حقل، نفذ الحفظ مباشرة
                    document.getElementById(saveBtnId).click();
                }
            }
        });
        // دعم زر "التالي" في كيبورد الموبايل (inputmode/enterkeyhint)
        field.setAttribute('enterkeyhint', idx < fields.length - 1 ? 'next' : 'done');
    });
}

// تفعيل التنقل في النماذج
enableEnterNavigation(prescriptionFields, 'reviewBtn');
enableEnterNavigation(anotherFields, 'saveAnotherBtn');

// التنقل في نموذج الاستعلام
const inquireCodeField = document.getElementById('inquireCode');
inquireCodeField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        // لا تمنع الافتراضي هنا لأن الفورم سيعمل submit تلقائياً
        // لكن إذا أردت التنقل لزر البحث فقط:
        // e.preventDefault();
        // document.querySelector('#inquireForm button[type="submit"]').focus();
    }
});

// عند فتح النموذج أو إعادة تعيينه، اجعل حقل الموبايل يبدأ بـ 01
function setMobilePrefix() {
    if (!mobileNumber.value.startsWith('01')) {
        mobileNumber.value = '01';
    }
}
prescriptionForm.addEventListener('reset', setMobilePrefix);
document.getElementById('sendPrescriptionBtn').addEventListener('click', function() {
    setTimeout(setMobilePrefix, 0);
});

// منع حذف أو تعديل أول رقمين في حقل الموبايل
mobileNumber.addEventListener('keydown', function(e) {
    // السماح بالأسهم، التاب، الشيفت، إلخ
    if (
        ['ArrowLeft', 'ArrowRight', 'Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)
    ) return;
    // لا تسمح بالحذف أو الرجوع للخلف في أول رقمين
    if ((this.selectionStart <= 2) && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
    }
});
mobileNumber.addEventListener('input', function(e) {
    // إذا حذف المستخدم أول رقمين أو عدلهم، أعدهم تلقائيًا
    if (!this.value.startsWith('01')) {
        this.value = '01' + this.value.replace(/^0+1*/, '');
    }
    // لا تسمح بأكثر من 11 رقم
    if (this.value.length > 11) {
        this.value = this.value.slice(0, 11);
    }
});

// عند صفحة مراجعة البيانات، إذا ضغط المستخدم ENTER على الكمبيوتر (وليس موبايل)، يتم حفظ البيانات
reviewSection.addEventListener('keydown', function(e) {
    // تجاهل إذا كان الجهاز موبايل (شاشة صغيرة أو لمس)
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent) || window.innerWidth < 700;
    if (!isMobile && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('saveBtn').click();
    }
});