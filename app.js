/**
 * 올본한의원 복약 피드백 설문 - App Logic
 */

// Configuration
const CONFIG = {
    webAppUrl: 'https://script.google.com/macros/s/AKfycbwp-SfLx4AqzBqu77dFFKOUDZ1165ijoLhbV3kex0Mjj-2BLUzeBt5grWHvv7SqQInvTQ/exec',
    totalSteps: 5
};

// State
let currentStep = 1;
let uploadedImages = [];

// DOM Elements
const elements = {
    greeting: document.getElementById('greeting'),
    progressFill: document.getElementById('progressFill'),
    stepIndicators: document.querySelectorAll('.step-indicator'),
    steps: document.querySelectorAll('.step'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    submitBtn: document.getElementById('submitBtn'),
    surveyForm: document.getElementById('surveyForm'),
    successScreen: document.getElementById('successScreen'),
    alertBox: document.getElementById('alertBox'),
    uploadArea: document.getElementById('uploadArea'),
    photoInput: document.getElementById('photoInput'),
    previewContainer: document.getElementById('previewContainer'),
    uploadPlaceholder: document.getElementById('uploadPlaceholder')
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupPersonalizedGreeting();
    setupEventListeners();
    updateUI();
}

/**
 * URL 파라미터에서 이름을 읽어 인사말 설정
 */
function setupPersonalizedGreeting() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');

    if (name) {
        elements.greeting.textContent = `안녕하세요, ${name}님!`;
    } else {
        elements.greeting.textContent = '안녕하세요!';
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // Navigation buttons
    elements.prevBtn.addEventListener('click', goToPrevStep);
    elements.nextBtn.addEventListener('click', goToNextStep);
    elements.surveyForm.addEventListener('submit', handleSubmit);

    // Photo upload
    elements.uploadArea.addEventListener('click', () => elements.photoInput.click());
    elements.photoInput.addEventListener('change', handlePhotoUpload);

    // Step 4: 불편 반응 선택 시 안심 안내 표시
    const adverseCheckboxes = document.querySelectorAll('input[name="adverse"]');
    adverseCheckboxes.forEach(cb => {
        cb.addEventListener('change', handleAdverseSelection);
    });

    // "없음" 선택 시 다른 옵션 해제
    document.getElementById('noAdverse').addEventListener('change', function () {
        if (this.checked) {
            adverseCheckboxes.forEach(cb => {
                if (cb.value !== '없음') cb.checked = false;
            });
            toggleAlertBox(false);
        }
    });

    // Step 3: "기타" 선택 시 입력창 표시
    const positiveOtherCheckbox = document.getElementById('positiveOther');
    const positiveOtherInput = document.getElementById('positiveOtherInput');

    positiveOtherCheckbox.addEventListener('change', function () {
        positiveOtherInput.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            document.getElementById('positiveOtherText').focus();
        }
    });

    // Step 4: "기타" 선택 시 입력창 표시
    const adverseOtherCheckbox = document.getElementById('adverseOther');
    const adverseOtherInput = document.getElementById('adverseOtherInput');

    adverseOtherCheckbox.addEventListener('change', function () {
        adverseOtherInput.style.display = this.checked ? 'block' : 'none';
        if (this.checked) {
            document.getElementById('adverseOtherText').focus();
        }
    });
}

/**
 * 불편 반응 선택 처리
 */
function handleAdverseSelection(e) {
    const adverseCheckboxes = document.querySelectorAll('input[name="adverse"]');
    const noAdverse = document.getElementById('noAdverse');

    // 다른 옵션 선택 시 "없음" 해제
    if (e.target.value !== '없음' && e.target.checked) {
        noAdverse.checked = false;
    }

    // "없음" 외의 선택이 있는지 확인
    const hasAdverseSymptom = Array.from(adverseCheckboxes).some(
        cb => cb.checked && cb.value !== '없음'
    );

    toggleAlertBox(hasAdverseSymptom);
}

/**
 * 안심 안내 박스 토글
 */
function toggleAlertBox(show) {
    elements.alertBox.classList.toggle('visible', show);
}

/**
 * 사진 업로드 처리
 */
function handlePhotoUpload(e) {
    const files = Array.from(e.target.files);

    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImages.push({
                name: file.name,
                data: event.target.result
            });
            renderImagePreviews();
        };
        reader.readAsDataURL(file);
    });
}

/**
 * 이미지 프리뷰 렌더링
 */
function renderImagePreviews() {
    elements.previewContainer.innerHTML = '';

    if (uploadedImages.length > 0) {
        elements.uploadPlaceholder.style.display = 'none';
    } else {
        elements.uploadPlaceholder.style.display = 'flex';
    }

    uploadedImages.forEach((img, index) => {
        const preview = document.createElement('div');
        preview.className = 'preview-item';
        preview.innerHTML = `
            <img src="${img.data}" alt="Preview">
            <button type="button" class="preview-remove" data-index="${index}">×</button>
        `;

        preview.querySelector('.preview-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            uploadedImages.splice(index, 1);
            renderImagePreviews();
        });

        elements.previewContainer.appendChild(preview);
    });
}

/**
 * 이전 단계로 이동
 */
function goToPrevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
}

/**
 * 다음 단계로 이동
 */
function goToNextStep() {
    if (!validateCurrentStep()) {
        return;
    }

    if (currentStep < CONFIG.totalSteps) {
        currentStep++;
        updateUI();
    }
}

/**
 * 현재 단계 유효성 검사
 */
function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`);

    switch (currentStep) {
        case 1:
            const compliance = currentStepEl.querySelector('input[name="compliance"]:checked');
            if (!compliance) {
                shakeElement(currentStepEl.querySelector('.option-grid'));
                return false;
            }
            break;
        case 2:
            const timing = currentStepEl.querySelector('input[name="timing"]:checked');
            const temperature = currentStepEl.querySelector('input[name="temperature"]:checked');
            const experience = currentStepEl.querySelector('input[name="experience"]:checked');
            if (!timing || !temperature || !experience) {
                if (!timing) shakeElement(currentStepEl.querySelectorAll('.sub-section')[0]);
                if (!temperature) shakeElement(currentStepEl.querySelectorAll('.sub-section')[1]);
                if (!experience) shakeElement(currentStepEl.querySelectorAll('.sub-section')[2]);
                return false;
            }
            break;
        // Steps 3, 4, 5 are optional or have defaults
    }

    return true;
}

/**
 * 요소 흔들기 애니메이션
 */
function shakeElement(el) {
    el.style.animation = 'shake 0.5s ease';
    setTimeout(() => el.style.animation = '', 500);
}

// Add shake animation to CSS dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

/**
 * UI 업데이트
 */
function updateUI() {
    // Update progress bar
    const progress = (currentStep / CONFIG.totalSteps) * 100;
    elements.progressFill.style.width = `${progress}%`;

    // Update step indicators
    elements.stepIndicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');

        if (stepNum < currentStep) {
            indicator.classList.add('completed');
        } else if (stepNum === currentStep) {
            indicator.classList.add('active');
        }
    });

    // Show current step
    elements.steps.forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });

    // Update buttons
    elements.prevBtn.disabled = currentStep === 1;

    if (currentStep === CONFIG.totalSteps) {
        elements.nextBtn.style.display = 'none';
        elements.submitBtn.style.display = 'block';
    } else {
        elements.nextBtn.style.display = 'block';
        elements.submitBtn.style.display = 'none';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 폼 제출 처리
 */
async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = elements.submitBtn;
    submitBtn.classList.add('loading');
    submitBtn.textContent = '제출 중...';

    try {
        const formData = collectFormData();
        console.log('Submitting data:', formData);

        // Send to Google Apps Script
        const response = await fetch(CONFIG.webAppUrl, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script requires no-cors
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // With no-cors, we can't read the response, assume success
        showSuccessScreen();

    } catch (error) {
        console.error('Submit error:', error);
        alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
        submitBtn.classList.remove('loading');
        submitBtn.textContent = '제출하기 ✓';
    }
}

/**
 * 폼 데이터 수집
 */
function collectFormData() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name') || '미입력';

    // Step 1
    const compliance = document.querySelector('input[name="compliance"]:checked')?.value || '';

    // Step 2
    const timing = document.querySelector('input[name="timing"]:checked')?.value || '';
    const temperature = document.querySelector('input[name="temperature"]:checked')?.value || '';
    const experience = document.querySelector('input[name="experience"]:checked')?.value || '';

    // Step 3 (multiple)
    let positiveChanges = Array.from(document.querySelectorAll('input[name="positive"]:checked'))
        .map(cb => cb.value)
        .filter(v => v !== '기타'); // 기타는 별도 처리

    // 기타 입력값 추가
    const positiveOtherText = document.getElementById('positiveOtherText')?.value.trim();
    if (document.getElementById('positiveOther')?.checked && positiveOtherText) {
        positiveChanges.push('기타: ' + positiveOtherText);
    }

    // Step 4 (multiple)
    let adverseReactions = Array.from(document.querySelectorAll('input[name="adverse"]:checked'))
        .map(cb => cb.value)
        .filter(v => v !== '기타'); // 기타는 별도 처리

    // 기타 입력값 추가
    const adverseOtherText = document.getElementById('adverseOtherText')?.value.trim();
    if (document.getElementById('adverseOther')?.checked && adverseOtherText) {
        adverseReactions.push('기타: ' + adverseOtherText);
    }

    // Step 5
    const feedback = document.getElementById('feedback').value.trim();

    // Images
    const images = uploadedImages.map(img => img.data);

    return {
        timestamp: new Date().toISOString(),
        name: name,
        compliance: compliance,
        timing: timing,
        temperature: temperature,
        experience: experience,
        positiveChanges: positiveChanges.join(', ') || '없음',
        adverseReactions: adverseReactions.join(', ') || '없음',
        feedback: feedback || '없음',
        hasImages: images.length > 0,
        imageCount: images.length,
        images: images
    };
}

/**
 * 성공 화면 표시
 */
function showSuccessScreen() {
    elements.surveyForm.style.display = 'none';
    document.querySelector('.nav-buttons').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    elements.successScreen.classList.add('visible');
}
