const calculateProfileCompletion = (profile) => {
  const requiredFields = [
    { field: 'personal.firstName', weight: 10 },
    { field: 'personal.lastName', weight: 10 },
    { field: 'personal.email', weight: 10 },
    { field: 'personal.phone', weight: 5 },
    { field: 'professional.title', weight: 10 },
    { field: 'professional.experience', weight: 5 },
    { field: 'education', weight: 15, check: (val) => val && val.length > 0 },
    { field: 'skills', weight: 15, check: (val) => val && val.length > 0 },
    { field: 'resume.fileName', weight: 10 },
    { field: 'personal.profilePhoto', weight: 10 }
  ];

  let completion = 0;
  
  requiredFields.forEach(item => {
    const value = getNestedValue(profile, item.field);
    if (item.check) {
      if (item.check(value)) completion += item.weight;
    } else if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) completion += item.weight;
      } else if (typeof value === 'string') {
        if (value.trim() !== '') completion += item.weight;
      } else {
        completion += item.weight;
      }
    }
  });

  return Math.min(100, completion);
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, p) => o ? o[p] : undefined, obj);
};

const formatProfileResponse = (profile) => {
  return {
    personal: {
      firstName: profile.personal.firstName,
      lastName: profile.personal.lastName,
      fullName: profile.personal.fullName,
      email: profile.personal.email,
      dateOfBirth: profile.personal.dateOfBirth,
      phone: profile.personal.phone,
      address: profile.personal.address,
      gender: profile.personal.gender,
      nationality: profile.personal.nationality,
      profilePhoto: profile.personal.profilePhoto,
      city: profile.personal.city,
      state: profile.personal.state,
      country: profile.personal.country,
      postalCode: profile.personal.postalCode
    },
    professional: {
      title: profile.professional.title,
      headline: profile.professional.headline,
      summary: profile.professional.summary,
      experience: profile.professional.experience,
      currentCompany: profile.professional.currentCompany,
      currentRole: profile.professional.currentRole,
      expectedSalary: profile.professional.expectedSalary,
      expectedSalaryCurrency: profile.professional.expectedSalaryCurrency,
      noticePeriod: profile.professional.noticePeriod,
      noticePeriodUnit: profile.professional.noticePeriodUnit,
      availability: profile.professional.availability,
      candidateId: profile.professional.candidateId,
      status: profile.professional.status,
      memberSince: profile.professional.memberSince,
      jobPreferences: profile.professional.jobPreferences
    },
    education: profile.education,
    skills: profile.skills,
    socialLinks: profile.socialLinks,
    resume: profile.resume,
    profileCompletion: profile.profileCompletion,
    isProfileComplete: profile.isProfileComplete,
    lastUpdated: profile.lastUpdated,
    metadata: profile.metadata,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

module.exports = {
  calculateProfileCompletion,
  getNestedValue,
  formatProfileResponse
};