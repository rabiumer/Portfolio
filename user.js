import { supabase } from './supabase.js';

// --- Utility Functions ---

const updateElementText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
};

const updateElementSrc = (id, src) => {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
};

const updateElementHref = (id, href, text) => {
    const el = document.getElementById(id);
    if (el && href) {
        el.href = href;
        if (text) el.innerText = text;
    }
};

// --- Data Fetching ---

async function fetchAbout() {
    const { data, error } = await supabase.from('about').select('*').single();
    if (data) {
        updateElementText('hero-title', `${data.name || 'Graphic Designer'} & \nWeb & App Developer`);
        updateElementText('hero-description', data.description || 'Professional portfolio.');
        updateElementSrc('profile-img', data.profile_image);
        
        // About Page specific
        updateElementText('about-name', data.name);
        updateElementText('about-description', data.description);
        updateElementText('about-experience', data.experience_years);
        updateElementText('about-clients', data.clients_number);
        updateElementText('about-projects', data.projects_done || '50+');
        updateElementSrc('about-img', data.profile_image);
    }
}

async function fetchDetails() {
    const { data, error } = await supabase.from('details').select('*');
    if (data) {
        const container = document.getElementById('about-details');
        if (container) {
            container.innerHTML = data.map(detail => `
                <div class="glass" style="padding: 1rem; text-align: center;">
                    <p style="font-weight: 700; color: var(--primary);">${detail.label}</p>
                    <p style="color: var(--text);">${detail.value}</p>
                </div>
            `).join('');
        }
    }
}

async function fetchSkills() {
    const { data, error } = await supabase.from('skills').select('*').order('percentage', { ascending: false });
    if (data) {
        const grid = document.getElementById('skills-grid');
        if (grid) {
            grid.innerHTML = data.map(skill => `
                <div class="glass-card skill-card">
                    <div class="skill-header">
                        <img src="${skill.image_url}" alt="${skill.name}" class="skill-icon">
                        <div class="skill-name">${skill.name}</div>
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                            <span class="text-muted" style="color: var(--text-muted); font-size: 0.9rem;">Proficiency</span>
                            <span class="skill-percentage">${skill.percentage || 0}%</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${skill.percentage || 0}%"></div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Trigger animation after slightly delay
            setTimeout(() => {
                const bars = document.querySelectorAll('.progress-bar');
                bars.forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => bar.style.width = width, 100);
                });
            }, 100);
        }
    }
}

async function fetchGraphicProjects() {
    const { data, error } = await supabase.from('graphic_projects').select('*').order('created_at', { ascending: false });
    if (data) {
        const grid = document.getElementById('graphic-grid');
        if (grid) {
            grid.innerHTML = data.map(project => `
                <div class="project-card" onclick="openLightbox('${project.image_url}')">
                    <img src="${project.image_url}" alt="${project.project_name}">
                    <div class="project-overlay">
                        <h3>${project.project_name}</h3>
                        <span>${project.category || 'Portfolio Work'}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

async function fetchWebProjects() {
    const { data, error } = await supabase.from('web_projects').select('*').order('created_at', { ascending: false });
    if (data) {
        const grid = document.getElementById('web-grid');
        if (grid) {
            grid.innerHTML = data.map(project => `
                <div class="glass-card web-card">
                    <img src="${project.image_url}" alt="${project.project_name}" class="web-screenshot">
                    <div class="web-content">
                        <span class="web-category">${project.category || 'Web Application'}</span>
                        <h3 class="text-gradient">${project.project_name}</h3>
                        <p class="web-desc">${project.description || 'A stunning web project built with modern technologies.'}</p>
                        <div style="margin-top: auto; display: flex; gap: 1rem; width: 100%;">
                            <a href="${project.project_link}" target="_blank" class="btn btn-primary" style="flex: 1; justify-content: center;"><ion-icon name="eye-outline"></ion-icon> Live Preview</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

async function fetchContact() {
    const { data, error } = await supabase.from('contact').select('*').single();
    if (data) {
        updateElementHref('contact-whatsapp', `https://wa.me/${data.whatsapp}`, `WhatsApp: ${data.whatsapp}`);
        updateElementHref('contact-email', `mailto:${data.email}`, `Email: ${data.email}`);
    }
}

// --- Lightbox Functions ---

window.openLightbox = (src) => {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (lightbox && img) {
        img.src = src;
        lightbox.style.display = 'flex';
    }
};

const lightbox = document.getElementById('lightbox');
if (lightbox) {
    lightbox.onclick = () => lightbox.style.display = 'none';
}

// --- Form Handling ---

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.onsubmit = async (e) => {
        e.preventDefault();
        const status = document.getElementById('form-status');
        status.innerText = 'Sending...';

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        const { error } = await supabase.from('messages').insert([{ name, email, message }]);
        
        if (error) {
            status.innerText = 'Error sending message.';
            status.style.color = 'var(--accent)';
        } else {
            status.innerText = 'Message sent successfully!';
            status.style.color = 'var(--primary)';
            contactForm.reset();
        }
    };
}

// --- Real-time Subscriptions ---

const channel = supabase.channel('realtime-portfolio')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'about' }, fetchAbout)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'details' }, fetchDetails)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, fetchSkills)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'graphic_projects' }, fetchGraphicProjects)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'web_projects' }, fetchWebProjects)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contact' }, fetchContact)
    .subscribe();

// --- Initial Page Load & UI Logic ---

document.addEventListener('DOMContentLoaded', () => {
    fetchAbout();
    fetchDetails();
    fetchSkills();
    fetchGraphicProjects();
    fetchWebProjects();
    fetchContact();

    // Hamburger Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('menu-open');
        });
    }

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        if(themeIcon) themeIcon.name = 'sunny-outline';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if(themeIcon) {
                themeIcon.name = isLight ? 'sunny-outline' : 'moon-outline';
            }
        });
    }
});
