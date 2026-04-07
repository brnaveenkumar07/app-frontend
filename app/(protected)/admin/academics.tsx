import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { ActionButton } from '../../../src/components/ui/action-button';
import { EmptyState, FormSection, HeroBanner, InlineMetric, SectionBlock } from '../../../src/components/ui/enterprise';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { StatusPill } from '../../../src/components/ui/status-pill';
import {
  useAdminAcademicsOverview,
  useCreateAcademicClass,
  useCreateAcademicYear,
  useCreateDepartment,
  useCreateInternalMarksPolicy,
  useCreateSection,
  useCreateSemester,
  useCreateSubject,
  useCreateSubjectOffering,
  useCreateTeacherAssignment,
  useDeleteAcademicClass,
  useDeleteAcademicYear,
  useDeleteDepartment,
  useDeleteInternalMarksPolicy,
  useDeleteSection,
  useDeleteSemester,
  useDeleteSubject,
  useDeleteSubjectOffering,
  useDeleteTeacherAssignment,
  useUpdateAcademicClass,
  useUpdateAcademicYear,
  useUpdateDepartment,
  useUpdateInternalMarksPolicy,
  useUpdateSection,
  useUpdateSemester,
  useUpdateSubject,
  useUpdateSubjectOffering,
  useUpdateTeacherAssignment,
} from '../../../src/features/academics/use-academics';
import { useFeedback } from '../../../src/providers/feedback-provider';

const actionRowStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 } as const;
const inputStyle = { backgroundColor: 'rgba(7, 17, 29, 0.68)' } as const;

export default function AdminAcademicsScreen() {
  const [studio, setStudio] = useState<'departments' | 'classes' | 'sections' | 'subjects' | 'years' | 'semesters' | 'offerings' | 'assignments' | 'policies'>('classes');
  const [departmentForm, setDepartmentForm] = useState({ id: '', code: '', name: '', shortName: '', schemeLabel: '' });
  const [classForm, setClassForm] = useState({ id: '', name: '', gradeLevel: '1' });
  const [sectionForm, setSectionForm] = useState({ id: '', classId: '', departmentId: '', semesterId: '', semesterNumber: '1', name: '', roomLabel: '' });
  const [subjectForm, setSubjectForm] = useState({ id: '', departmentId: '', code: '', name: '', description: '', subjectType: 'THEORY', credits: '', lectureHours: '', practicalHours: '', schemeVersion: '' });
  const [yearForm, setYearForm] = useState({ id: '', name: '', startYear: '2026', endYear: '2027', isActive: 'true' });
  const [semesterForm, setSemesterForm] = useState({ id: '', departmentId: '', academicYearId: '', number: '1', label: '' });
  const [offeringForm, setOfferingForm] = useState({
    id: '',
    departmentId: '',
    academicYearId: '',
    semesterId: '',
    sectionId: '',
    subjectId: '',
    internalMarksPolicyId: '',
    totalInternalMarks: '50',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    id: '',
    teacherId: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    subjectOfferingId: '',
    isClassLead: false,
  });
  const [policyForm, setPolicyForm] = useState({
    id: '',
    name: '',
    departmentId: '',
    academicYearId: '',
    semesterId: '',
    totalMarks: '50',
    attendanceThreshold: '75',
    attendanceBonusMarks: '2',
    componentsText: 'IA1:Internal Assessment 1:20\nIA2:Internal Assessment 2:15\nASSIGN:Assignment:5\nQUIZ:Quiz:5\nPRES:Presentation:5',
  });

  const overview = useAdminAcademicsOverview();
  const createClass = useCreateAcademicClass();
  const updateClass = useUpdateAcademicClass();
  const deleteClass = useDeleteAcademicClass();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const createAcademicYear = useCreateAcademicYear();
  const updateAcademicYear = useUpdateAcademicYear();
  const deleteAcademicYear = useDeleteAcademicYear();
  const createSemester = useCreateSemester();
  const updateSemester = useUpdateSemester();
  const deleteSemester = useDeleteSemester();
  const createSubjectOffering = useCreateSubjectOffering();
  const updateSubjectOffering = useUpdateSubjectOffering();
  const deleteSubjectOffering = useDeleteSubjectOffering();
  const createTeacherAssignment = useCreateTeacherAssignment();
  const updateTeacherAssignment = useUpdateTeacherAssignment();
  const deleteTeacherAssignment = useDeleteTeacherAssignment();
  const createPolicy = useCreateInternalMarksPolicy();
  const updatePolicy = useUpdateInternalMarksPolicy();
  const deletePolicy = useDeleteInternalMarksPolicy();
  const { showNotice } = useFeedback();

  const departments = overview.data?.departments ?? [];
  const teachers = overview.data?.teachers ?? [];
  const academicYears = overview.data?.academicYears ?? [];
  const semesters = overview.data?.semesters ?? [];
  const offerings = overview.data?.subjectOfferings ?? [];
  const policies = overview.data?.internalMarksPolicies ?? [];
  const classes = overview.data?.classes ?? [];
  const sections = useMemo(
    () =>
      classes.flatMap((academicClass: any) =>
        academicClass.sections.map((section: any) => ({
          id: section.id,
          label: `${academicClass.name} | Section ${section.name}`,
          className: academicClass.name,
          roomLabel: section.roomLabel,
          studentCount: section.studentCount,
          departmentId: section.departmentId,
          semesterNumber: section.semesterNumber,
          assignments: section.assignments,
        })),
      ),
    [classes],
  );
  const subjects = overview.data?.subjects ?? [];
  const existingAssignments = useMemo(
    () =>
      classes.flatMap((academicClass: any) =>
        academicClass.sections.flatMap((section: any) =>
          (section.assignments ?? []).map((assignment: any) => ({
            id: assignment.id,
            classId: academicClass.id,
            className: academicClass.name,
            sectionId: section.id,
            sectionName: section.name,
            subjectName: assignment.subjectName,
            teacherName: assignment.teacherName,
          })),
        ),
      ),
    [classes],
  );
  const selectedTeacher = teachers.find((teacher: any) => teacher.id === assignmentForm.teacherId);
  const selectedClass = classes.find((item: any) => item.id === assignmentForm.classId);
  const assignmentSections = sections.filter((section: any) => !assignmentForm.classId || section.className === selectedClass?.name);
  const selectedSection = assignmentSections.find((section: any) => section.id === assignmentForm.sectionId);
  const selectedSubject = subjects.find((subject: any) => subject.id === assignmentForm.subjectId);
  const relevantOfferings = offerings.filter(
    (offering: any) =>
      (!assignmentForm.sectionId || offering.sectionId === assignmentForm.sectionId) &&
      (!assignmentForm.subjectId || offering.subjectId === assignmentForm.subjectId),
  );
  const selectedOffering = relevantOfferings.find((offering: any) => offering.id === assignmentForm.subjectOfferingId);
  const selectedSectionClass = classes.find((item: any) => item.id === sectionForm.classId);
  const selectedSectionDepartment = departments.find((department: any) => department.id === sectionForm.departmentId);
  const selectedSectionSemester = semesters.find((semester: any) => semester.id === sectionForm.semesterId);
  const selectedSubjectDepartment = departments.find((department: any) => department.id === subjectForm.departmentId);
  const selectedSemesterDepartment = departments.find((department: any) => department.id === semesterForm.departmentId);
  const selectedSemesterYear = academicYears.find((year: any) => year.id === semesterForm.academicYearId);
  const selectedOfferingDepartment = departments.find((department: any) => department.id === offeringForm.departmentId);
  const selectedOfferingYear = academicYears.find((year: any) => year.id === offeringForm.academicYearId);
  const selectedOfferingSemester = semesters.find((semester: any) => semester.id === offeringForm.semesterId);
  const selectedOfferingSection = sections.find((section: any) => section.id === offeringForm.sectionId);
  const selectedOfferingSubject = subjects.find((subject: any) => subject.id === offeringForm.subjectId);
  const selectedPolicy = policies.find((policy: any) => policy.id === offeringForm.internalMarksPolicyId);

  const parseComponents = () =>
    policyForm.componentsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [code, name, maxMarks] = line.split(':');
        return {
          code,
          name,
          maxMarks: Number(maxMarks),
          displayOrder: index + 1,
        };
      });

  const showAcademicNotice = (title: string, message: string, tone: 'success' | 'error') => {
    showNotice({ title, message, tone });
  };

  const handleClassSave = async () => {
    const payload = {
      name: classForm.name,
      gradeLevel: Number(classForm.gradeLevel),
    };

    try {
      if (classForm.id) {
        await updateClass.mutateAsync({ id: classForm.id, ...payload });
        showAcademicNotice('Class updated', 'The class details were saved successfully.', 'success');
      } else {
        await createClass.mutateAsync(payload);
        showAcademicNotice('Class created', 'The class is ready for section management.', 'success');
      }
      setClassForm({ id: '', name: '', gradeLevel: '1' });
    } catch {
      showAcademicNotice('Class failed', 'We could not save this class right now.', 'error');
    }
  };

  const handleDepartmentSave = async () => {
    const payload = {
      code: departmentForm.code,
      name: departmentForm.name,
      shortName: departmentForm.shortName,
      schemeLabel: departmentForm.schemeLabel,
    };

    try {
      if (departmentForm.id) {
        await updateDepartment.mutateAsync({ id: departmentForm.id, ...payload });
        showAcademicNotice('Branch updated', 'The branch details were saved successfully.', 'success');
      } else {
        await createDepartment.mutateAsync(payload);
        showAcademicNotice('Branch created', 'The new branch is ready for academic setup.', 'success');
      }
      setDepartmentForm({ id: '', code: '', name: '', shortName: '', schemeLabel: '' });
    } catch {
      showAcademicNotice('Branch save failed', 'We could not save this branch right now.', 'error');
    }
  };

  const handleSectionSave = async () => {
    const payload = {
      classId: sectionForm.classId,
      departmentId: sectionForm.departmentId || undefined,
      semesterId: sectionForm.semesterId || undefined,
      semesterNumber: Number(sectionForm.semesterNumber),
      name: sectionForm.name,
      roomLabel: sectionForm.roomLabel || undefined,
    };

    try {
      if (sectionForm.id) {
        await updateSection.mutateAsync({ id: sectionForm.id, ...payload });
        showAcademicNotice('Section updated', 'The section details were saved successfully.', 'success');
      } else {
        await createSection.mutateAsync(payload);
        showAcademicNotice('Section created', 'The section is ready for roster and timetable mapping.', 'success');
      }
      setSectionForm({ id: '', classId: '', departmentId: '', semesterId: '', semesterNumber: '1', name: '', roomLabel: '' });
    } catch {
      showAcademicNotice('Section failed', 'We could not save this section right now.', 'error');
    }
  };

  const handleSubjectSave = async () => {
    const payload = {
      departmentId: subjectForm.departmentId || undefined,
      code: subjectForm.code,
      name: subjectForm.name,
      description: subjectForm.description || undefined,
      subjectType: subjectForm.subjectType as any,
      credits: subjectForm.credits ? Number(subjectForm.credits) : undefined,
      lectureHours: subjectForm.lectureHours ? Number(subjectForm.lectureHours) : undefined,
      practicalHours: subjectForm.practicalHours ? Number(subjectForm.practicalHours) : undefined,
      schemeVersion: subjectForm.schemeVersion || undefined,
    };

    try {
      if (subjectForm.id) {
        await updateSubject.mutateAsync({ id: subjectForm.id, ...payload });
        showAcademicNotice('Subject updated', 'The subject was saved successfully.', 'success');
      } else {
        await createSubject.mutateAsync(payload);
        showAcademicNotice('Subject created', 'The subject is ready for academic offerings.', 'success');
      }
      setSubjectForm({ id: '', departmentId: '', code: '', name: '', description: '', subjectType: 'THEORY', credits: '', lectureHours: '', practicalHours: '', schemeVersion: '' });
    } catch {
      showAcademicNotice('Subject failed', 'We could not save this subject right now.', 'error');
    }
  };

  const handleAcademicYearSave = async () => {
    const payload = {
      name: yearForm.name,
      startYear: Number(yearForm.startYear),
      endYear: Number(yearForm.endYear),
      isActive: yearForm.isActive === 'true',
    };

    try {
      if (yearForm.id) {
        await updateAcademicYear.mutateAsync({ id: yearForm.id, ...payload });
        showAcademicNotice('Academic year updated', 'The academic year changes were saved successfully.', 'success');
      } else {
        await createAcademicYear.mutateAsync(payload);
        showAcademicNotice('Academic year created', 'The academic year is now available for setup.', 'success');
      }
      setYearForm({ id: '', name: '', startYear: '2026', endYear: '2027', isActive: 'true' });
    } catch {
      showAcademicNotice('Academic year failed', 'We could not save the academic year right now.', 'error');
    }
  };

  const handleSemesterSave = async () => {
    const payload = {
      departmentId: semesterForm.departmentId,
      academicYearId: semesterForm.academicYearId || undefined,
      number: Number(semesterForm.number),
      label: semesterForm.label,
    };

    try {
      if (semesterForm.id) {
        await updateSemester.mutateAsync({ id: semesterForm.id, ...payload });
        showAcademicNotice('Semester updated', 'The semester details were saved successfully.', 'success');
      } else {
        await createSemester.mutateAsync(payload);
        showAcademicNotice('Semester created', 'The semester is now available for academic mapping.', 'success');
      }
      setSemesterForm({ id: '', departmentId: '', academicYearId: '', number: '1', label: '' });
    } catch {
      showAcademicNotice('Semester failed', 'We could not save the semester right now.', 'error');
    }
  };

  const handleOfferingSave = async () => {
    const payload = {
      departmentId: offeringForm.departmentId,
      academicYearId: offeringForm.academicYearId || undefined,
      semesterId: offeringForm.semesterId,
      sectionId: offeringForm.sectionId || undefined,
      subjectId: offeringForm.subjectId,
      internalMarksPolicyId: offeringForm.internalMarksPolicyId || undefined,
      totalInternalMarks: Number(offeringForm.totalInternalMarks),
    };

    try {
      if (offeringForm.id) {
        await updateSubjectOffering.mutateAsync({ id: offeringForm.id, ...payload });
        showAcademicNotice('Offering updated', 'The subject offering was saved successfully.', 'success');
      } else {
        await createSubjectOffering.mutateAsync(payload);
        showAcademicNotice('Offering created', 'The subject offering is ready for teaching workflows.', 'success');
      }
      setOfferingForm({ id: '', departmentId: '', academicYearId: '', semesterId: '', sectionId: '', subjectId: '', internalMarksPolicyId: '', totalInternalMarks: '50' });
    } catch {
      showAcademicNotice('Offering failed', 'We could not save the subject offering right now.', 'error');
    }
  };

  const handlePolicySave = async () => {
    const payload = {
      name: policyForm.name,
      departmentId: policyForm.departmentId || undefined,
      academicYearId: policyForm.academicYearId || undefined,
      semesterId: policyForm.semesterId || undefined,
      totalMarks: Number(policyForm.totalMarks),
      attendanceThreshold: Number(policyForm.attendanceThreshold),
      attendanceBonusMarks: Number(policyForm.attendanceBonusMarks),
      components: parseComponents(),
    };

    try {
      if (policyForm.id) {
        await updatePolicy.mutateAsync({ id: policyForm.id, ...payload });
        showAcademicNotice('Policy updated', 'The internal marks policy was saved successfully.', 'success');
      } else {
        await createPolicy.mutateAsync(payload);
        showAcademicNotice('Policy created', 'The internal marks policy is ready to use.', 'success');
      }
      setPolicyForm({ id: '', name: '', departmentId: '', academicYearId: '', semesterId: '', totalMarks: '50', attendanceThreshold: '75', attendanceBonusMarks: '2', componentsText: 'IA1:Internal Assessment 1:20\nIA2:Internal Assessment 2:15\nASSIGN:Assignment:5\nQUIZ:Quiz:5\nPRES:Presentation:5' });
    } catch {
      showAcademicNotice('Policy failed', 'We could not save the internal marks policy right now.', 'error');
    }
  };

  const handleAssignmentSave = async () => {
    const payload = {
      teacherId: assignmentForm.teacherId,
      classId: assignmentForm.classId,
      sectionId: assignmentForm.sectionId,
      subjectId: assignmentForm.subjectId,
      subjectOfferingId: assignmentForm.subjectOfferingId || undefined,
      isClassLead: assignmentForm.isClassLead,
    };

    try {
      if (assignmentForm.id) {
        await updateTeacherAssignment.mutateAsync({ id: assignmentForm.id, ...payload });
        showAcademicNotice('Assignment updated', 'The teacher mapping was saved successfully.', 'success');
      } else {
        await createTeacherAssignment.mutateAsync(payload);
        showAcademicNotice('Assignment created', 'The class and subject are now available in teacher workflows.', 'success');
      }
      setAssignmentForm({ id: '', teacherId: '', classId: '', sectionId: '', subjectId: '', subjectOfferingId: '', isClassLead: false });
    } catch {
      showAcademicNotice('Assignment failed', 'We could not save this teacher mapping right now.', 'error');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDepartment.mutateAsync(id);
      showAcademicNotice('Branch deleted', 'The branch was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this branch right now.', 'error');
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteClass.mutateAsync(id);
      showAcademicNotice('Class deleted', 'The class was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this class right now.', 'error');
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await deleteSection.mutateAsync(id);
      showAcademicNotice('Section deleted', 'The section was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this section right now.', 'error');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject.mutateAsync(id);
      showAcademicNotice('Subject deleted', 'The subject was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this subject right now.', 'error');
    }
  };

  const handleDeleteAcademicYear = async (id: string) => {
    try {
      await deleteAcademicYear.mutateAsync(id);
      showAcademicNotice('Academic year deleted', 'The academic year was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this academic year right now.', 'error');
    }
  };

  const handleDeleteSemester = async (id: string) => {
    try {
      await deleteSemester.mutateAsync(id);
      showAcademicNotice('Semester deleted', 'The semester was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this semester right now.', 'error');
    }
  };

  const handleDeleteOffering = async (id: string) => {
    try {
      await deleteSubjectOffering.mutateAsync(id);
      showAcademicNotice('Offering deleted', 'The subject offering was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this offering right now.', 'error');
    }
  };

  const handleDeletePolicy = async (id: string) => {
    try {
      await deletePolicy.mutateAsync(id);
      showAcademicNotice('Policy deleted', 'The internal marks policy was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this policy right now.', 'error');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteTeacherAssignment.mutateAsync(id);
      showAcademicNotice('Assignment deleted', 'The teacher mapping was removed successfully.', 'success');
    } catch {
      showAcademicNotice('Delete failed', 'We could not delete this teacher mapping right now.', 'error');
    }
  };

  return (
    <Screen>
      <HeroBanner
        eyebrow="Academics"
        title="Administer classes, sections, subjects, and scoring policies with better structure."
        description="The academic studio now separates core entities into focused workspaces so classes, sections, subjects, and internal marks setup feel cleaner on mobile."
        aside={<StatusPill label={studio} />}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Classes</Text>
            <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>{classes.length}</Text>
          </GlassCard>
        </View>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Subjects</Text>
            <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>{subjects.length}</Text>
          </GlassCard>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 16 }}>
        {[
          ['classes', 'Classes'],
          ['sections', 'Sections'],
          ['subjects', 'Subjects'],
          ['departments', 'Branches'],
          ['years', 'Years'],
          ['semesters', 'Semesters'],
          ['offerings', 'Offerings'],
          ['assignments', 'Assignments'],
          ['policies', 'Policies'],
        ].map(([value, label]) => (
          <ActionButton key={value} size="small" variant={studio === value ? 'primary' : 'ghost'} label={label} onPress={() => setStudio(value as typeof studio)} />
        ))}
      </ScrollView>

      {studio === 'classes' ? (
        <>
          <SectionBlock title={classForm.id ? 'Edit class' : 'Create class'} subtitle="Class setup is now shorter and easier to review before you define sections and offerings.">
            <FormSection title="Class details">
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput label="Class name" value={classForm.name} onChangeText={(value) => setClassForm((current) => ({ ...current, name: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Grade level" value={classForm.gradeLevel} onChangeText={(value) => setClassForm((current) => ({ ...current, gradeLevel: value }))} mode="outlined" style={[{ width: 120 }, inputStyle]} />
              </View>
              <ActionButton variant="primary" icon={classForm.id ? 'content-save-outline' : 'plus-circle-outline'} label={classForm.id ? 'Update class' : 'Create class'} onPress={() => void handleClassSave()} style={{ marginTop: 14 }} />
            </FormSection>
          </SectionBlock>

          {classes.length ? classes.map((academicClass: any) => (
            <GlassCard key={academicClass.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{academicClass.name}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>Grade {academicClass.gradeLevel} | {academicClass.sections.length} sections</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {academicClass.sections.slice(0, 3).map((section: any) => (
                  <InlineMetric key={section.id} label={section.name} value={`${section.studentCount} students`} />
                ))}
              </View>
              <View style={actionRowStyle}>
                <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setClassForm({ id: academicClass.id, name: academicClass.name, gradeLevel: String(academicClass.gradeLevel) })} />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteClass(academicClass.id)} />
              </View>
            </GlassCard>
          )) : <EmptyState title="No classes yet" description="Create classes here so sections, attendance, and marks flows have a stronger structure." />}
        </>
      ) : null}

      {studio === 'sections' ? (
        <>
          <SectionBlock title={sectionForm.id ? 'Edit section' : 'Create section'} subtitle="Sections now show class, semester, and room context much more clearly.">
            <FormSection title="Section details">
              <GlassCard style={{ padding: 14, borderRadius: 22, backgroundColor: 'rgba(7, 17, 29, 0.6)', marginBottom: 12 }}>
                <Text variant="labelLarge" style={{ color: '#8aa6c1' }}>Selected mapping</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 8 }}>Class: {selectedSectionClass?.name ?? 'Not selected'}</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Department: {selectedSectionDepartment?.code ?? 'Optional / not selected'}</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Semester: {selectedSectionSemester?.label ?? 'Optional / not selected'}</Text>
              </GlassCard>
              <TextInput label="Class" value={selectedSectionClass?.name ?? ''} editable={false} mode="outlined" style={inputStyle} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                {classes.map((item: any) => (
                  <ActionButton key={item.id} size="small" variant={sectionForm.classId === item.id ? 'primary' : 'ghost'} label={item.name} onPress={() => setSectionForm((current) => ({ ...current, classId: item.id }))} />
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TextInput label="Section name" value={sectionForm.name} onChangeText={(value) => setSectionForm((current) => ({ ...current, name: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Room" value={sectionForm.roomLabel} onChangeText={(value) => setSectionForm((current) => ({ ...current, roomLabel: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TextInput label="Department" value={selectedSectionDepartment?.code ?? ''} editable={false} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Semester no" value={sectionForm.semesterNumber} onChangeText={(value) => setSectionForm((current) => ({ ...current, semesterNumber: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                {departments.map((department: any) => (
                  <ActionButton key={department.id} size="small" variant={sectionForm.departmentId === department.id ? 'primary' : 'ghost'} label={department.code} onPress={() => setSectionForm((current) => ({ ...current, departmentId: department.id }))} />
                ))}
              </ScrollView>
              <TextInput label="Semester" value={selectedSectionSemester?.label ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                <ActionButton size="small" variant={sectionForm.semesterId === '' ? 'primary' : 'ghost'} label="No semester link" onPress={() => setSectionForm((current) => ({ ...current, semesterId: '' }))} />
                {semesters.map((semester: any) => (
                  <ActionButton key={semester.id} size="small" variant={sectionForm.semesterId === semester.id ? 'primary' : 'ghost'} label={semester.label} onPress={() => setSectionForm((current) => ({ ...current, semesterId: semester.id }))} />
                ))}
              </ScrollView>
              <ActionButton variant="primary" icon={sectionForm.id ? 'content-save-outline' : 'plus-circle-outline'} label={sectionForm.id ? 'Update section' : 'Create section'} onPress={() => void handleSectionSave()} style={{ marginTop: 14 }} />
            </FormSection>
          </SectionBlock>

          {sections.length ? sections.map((section: any) => (
            <GlassCard key={section.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{section.className} | Section {section.label.split('Section ')[1] ?? section.label}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>Sem {section.semesterNumber ?? '--'} | Room {section.roomLabel ?? '--'} | {section.studentCount ?? 0} students</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
                {(section.assignments ?? []).length ? section.assignments.map((assignment: any) => `${assignment.subjectName} / ${assignment.teacherName}`).join(' | ') : 'No teacher assignments yet'}
              </Text>
              <View style={actionRowStyle}>
                <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setSectionForm({ id: section.id, classId: classes.find((item: any) => section.label.startsWith(item.name))?.id ?? '', departmentId: section.departmentId ?? '', semesterId: '', semesterNumber: String(section.semesterNumber ?? 1), name: section.label.split('Section ')[1]?.split(' | ')[0] ?? '', roomLabel: section.roomLabel ?? '' })} />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteSection(section.id)} />
              </View>
            </GlassCard>
          )) : <EmptyState title="No sections yet" description="Create sections to support class rosters, offerings, and teacher assignments." />}
        </>
      ) : null}

      {studio === 'subjects' ? (
        <>
          <SectionBlock title={subjectForm.id ? 'Edit subject' : 'Create subject'} subtitle="Subjects are grouped into a cleaner, more professional academic catalog form.">
            <FormSection title="Subject details">
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput label="Code" value={subjectForm.code} onChangeText={(value) => setSubjectForm((current) => ({ ...current, code: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Type" value={subjectForm.subjectType} onChangeText={(value) => setSubjectForm((current) => ({ ...current, subjectType: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              </View>
              <TextInput label="Subject title" value={subjectForm.name} onChangeText={(value) => setSubjectForm((current) => ({ ...current, name: value }))} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
              <TextInput label="Department" value={selectedSubjectDepartment?.code ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                <ActionButton size="small" variant={subjectForm.departmentId === '' ? 'primary' : 'ghost'} label="All departments" onPress={() => setSubjectForm((current) => ({ ...current, departmentId: '' }))} />
                {departments.map((department: any) => (
                  <ActionButton key={department.id} size="small" variant={subjectForm.departmentId === department.id ? 'primary' : 'ghost'} label={department.code} onPress={() => setSubjectForm((current) => ({ ...current, departmentId: department.id }))} />
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TextInput label="Credits" value={subjectForm.credits} onChangeText={(value) => setSubjectForm((current) => ({ ...current, credits: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Scheme" value={subjectForm.schemeVersion} onChangeText={(value) => setSubjectForm((current) => ({ ...current, schemeVersion: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TextInput label="Lecture hours" value={subjectForm.lectureHours} onChangeText={(value) => setSubjectForm((current) => ({ ...current, lectureHours: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Practical hours" value={subjectForm.practicalHours} onChangeText={(value) => setSubjectForm((current) => ({ ...current, practicalHours: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              </View>
              <TextInput label="Description" value={subjectForm.description} onChangeText={(value) => setSubjectForm((current) => ({ ...current, description: value }))} mode="outlined" multiline numberOfLines={3} style={[{ marginTop: 12 }, inputStyle]} />
              <ActionButton variant="primary" icon={subjectForm.id ? 'content-save-outline' : 'plus-circle-outline'} label={subjectForm.id ? 'Update subject' : 'Create subject'} onPress={() => void handleSubjectSave()} style={{ marginTop: 14 }} />
            </FormSection>
          </SectionBlock>

          {subjects.length ? subjects.map((subject: any) => (
            <GlassCard key={subject.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{subject.code} | {subject.name}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>{subject.subjectType} | Credits {subject.credits ?? '--'} | Scheme {subject.schemeVersion ?? '--'}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>Lecture {subject.lectureHours ?? '--'} | Practical {subject.practicalHours ?? '--'}</Text>
              <View style={actionRowStyle}>
                <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setSubjectForm({ id: subject.id, departmentId: subject.departmentId ?? '', code: subject.code, name: subject.name, description: subject.description ?? '', subjectType: subject.subjectType ?? 'THEORY', credits: subject.credits ? String(subject.credits) : '', lectureHours: subject.lectureHours ? String(subject.lectureHours) : '', practicalHours: subject.practicalHours ? String(subject.practicalHours) : '', schemeVersion: subject.schemeVersion ?? '' })} />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteSubject(subject.id)} />
              </View>
            </GlassCard>
          )) : <EmptyState title="No subjects yet" description="Create subjects here so offerings and marks workflows have the right academic catalog." />}
        </>
      ) : null}

      {studio === 'departments' ? (
        <>
          <SectionBlock title={departmentForm.id ? 'Edit branch' : 'Create branch'} subtitle="Branch management is grouped so code, naming, and scheme stay easy to scan.">
            <FormSection title="Branch details">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput label="Code" value={departmentForm.code} onChangeText={(value) => setDepartmentForm((current) => ({ ...current, code: value }))} mode="outlined" style={[{ width: 100 }, inputStyle]} />
              <TextInput label="Branch name" value={departmentForm.name} onChangeText={(value) => setDepartmentForm((current) => ({ ...current, name: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Short name" value={departmentForm.shortName} onChangeText={(value) => setDepartmentForm((current) => ({ ...current, shortName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Scheme" value={departmentForm.schemeLabel} onChangeText={(value) => setDepartmentForm((current) => ({ ...current, schemeLabel: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <ActionButton variant="primary" icon={departmentForm.id ? 'content-save-outline' : 'plus-circle-outline'} label={departmentForm.id ? 'Update branch' : 'Create branch'} onPress={() => void handleDepartmentSave()} style={{ marginTop: 14 }} />
            </FormSection>
          </SectionBlock>

          {departments.map((department: any) => (
            <GlassCard key={department.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{department.name}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>{department.code} | {department.shortName ?? '--'} | {department.schemeLabel ?? 'Scheme pending'}</Text>
              <View style={actionRowStyle}>
                <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setDepartmentForm({ id: department.id, code: department.code, name: department.name, shortName: department.shortName ?? '', schemeLabel: department.schemeLabel ?? '' })} />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteDepartment(department.id)} />
              </View>
            </GlassCard>
          ))}
        </>
      ) : null}

      {studio === 'years' ? (
        <>
          <GlassCard style={{ marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ color: '#f7fbff', marginBottom: 12 }}>
              {yearForm.id ? 'Edit academic year' : 'Create academic year'}
            </Text>
            <TextInput label="Name" value={yearForm.name} onChangeText={(value) => setYearForm((current) => ({ ...current, name: value }))} mode="outlined" style={{ backgroundColor: 'transparent' }} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Start year" value={yearForm.startYear} onChangeText={(value) => setYearForm((current) => ({ ...current, startYear: value }))} mode="outlined" style={{ flex: 1, backgroundColor: 'transparent' }} />
              <TextInput label="End year" value={yearForm.endYear} onChangeText={(value) => setYearForm((current) => ({ ...current, endYear: value }))} mode="outlined" style={{ flex: 1, backgroundColor: 'transparent' }} />
            </View>
            <View style={actionRowStyle}>
              <ActionButton
                variant="primary"
                icon={yearForm.id ? 'content-save-outline' : 'plus-circle-outline'}
                label={yearForm.id ? 'Update year' : 'Create year'}
                onPress={() => void handleAcademicYearSave()}
              />
            </View>
          </GlassCard>

          {academicYears.map((year: any) => (
            <GlassCard key={year.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{year.name}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>{year.startYear} - {year.endYear} | {year.isActive ? 'Active' : 'Inactive'}</Text>
              <View style={actionRowStyle}>
                <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setYearForm({ id: year.id, name: year.name, startYear: String(year.startYear), endYear: String(year.endYear), isActive: year.isActive ? 'true' : 'false' })} />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteAcademicYear(year.id)} />
              </View>
            </GlassCard>
          ))}
        </>
      ) : null}

      {studio === 'semesters' ? (
        <>
          <GlassCard style={{ marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ color: '#f7fbff', marginBottom: 12 }}>
              {semesterForm.id ? 'Edit semester' : 'Create semester'}
            </Text>
            <TextInput label="Department" value={selectedSemesterDepartment?.code ?? ''} editable={false} mode="outlined" style={inputStyle} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {departments.map((department: any) => (
                <ActionButton key={department.id} size="small" variant={semesterForm.departmentId === department.id ? 'primary' : 'ghost'} label={department.code} onPress={() => setSemesterForm((current) => ({ ...current, departmentId: department.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Academic year" value={selectedSemesterYear?.name ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              <ActionButton size="small" variant={semesterForm.academicYearId === '' ? 'primary' : 'ghost'} label="No year link" onPress={() => setSemesterForm((current) => ({ ...current, academicYearId: '' }))} />
              {academicYears.map((year: any) => (
                <ActionButton key={year.id} size="small" variant={semesterForm.academicYearId === year.id ? 'primary' : 'ghost'} label={year.name} onPress={() => setSemesterForm((current) => ({ ...current, academicYearId: year.id }))} />
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Semester number" value={semesterForm.number} onChangeText={(value) => setSemesterForm((current) => ({ ...current, number: value }))} mode="outlined" style={{ width: 140, backgroundColor: 'transparent' }} />
              <TextInput label="Label" value={semesterForm.label} onChangeText={(value) => setSemesterForm((current) => ({ ...current, label: value }))} mode="outlined" style={{ flex: 1, backgroundColor: 'transparent' }} />
            </View>
            <View style={actionRowStyle}>
              <ActionButton
                variant="primary"
                icon={semesterForm.id ? 'content-save-outline' : 'plus-circle-outline'}
                label={semesterForm.id ? 'Update semester' : 'Create semester'}
                onPress={() => void handleSemesterSave()}
              />
            </View>
          </GlassCard>

          {semesters.map((semester: any) => (
            <GlassCard key={semester.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{semester.label}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>Sem {semester.number} | {semester.departmentName} | {semester.academicYearName ?? 'Year pending'}</Text>
              <View style={actionRowStyle}>
                <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setSemesterForm({ id: semester.id, departmentId: semester.departmentId, academicYearId: semester.academicYearId ?? '', number: String(semester.number), label: semester.label })} />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteSemester(semester.id)} />
              </View>
            </GlassCard>
          ))}
        </>
      ) : null}

      {studio === 'offerings' ? (
        <>
          <GlassCard style={{ marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ color: '#f7fbff', marginBottom: 12 }}>
              {offeringForm.id ? 'Edit subject offering' : 'Create subject offering'}
            </Text>
            <GlassCard style={{ padding: 14, borderRadius: 22, backgroundColor: 'rgba(7, 17, 29, 0.6)', marginBottom: 12 }}>
              <Text variant="labelLarge" style={{ color: '#8aa6c1' }}>Selected offering setup</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 8 }}>Department: {selectedOfferingDepartment?.code ?? 'Not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Year: {selectedOfferingYear?.name ?? 'Optional / not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Semester: {selectedOfferingSemester?.label ?? 'Not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Section: {selectedOfferingSection?.label ?? 'Optional / not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Subject: {selectedOfferingSubject ? `${selectedOfferingSubject.code} | ${selectedOfferingSubject.name}` : 'Not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Policy: {selectedPolicy?.name ?? 'Optional / not selected'}</Text>
            </GlassCard>
            <TextInput label="Department" value={selectedOfferingDepartment?.code ?? ''} editable={false} mode="outlined" style={inputStyle} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {departments.map((department: any) => (
                <ActionButton key={department.id} size="small" variant={offeringForm.departmentId === department.id ? 'primary' : 'ghost'} label={department.code} onPress={() => setOfferingForm((current) => ({ ...current, departmentId: department.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Academic year" value={selectedOfferingYear?.name ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              <ActionButton size="small" variant={offeringForm.academicYearId === '' ? 'primary' : 'ghost'} label="No year link" onPress={() => setOfferingForm((current) => ({ ...current, academicYearId: '' }))} />
              {academicYears.map((year: any) => (
                <ActionButton key={year.id} size="small" variant={offeringForm.academicYearId === year.id ? 'primary' : 'ghost'} label={year.name} onPress={() => setOfferingForm((current) => ({ ...current, academicYearId: year.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Semester" value={selectedOfferingSemester?.label ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {semesters.map((semester: any) => (
                <ActionButton key={semester.id} size="small" variant={offeringForm.semesterId === semester.id ? 'primary' : 'ghost'} label={semester.label} onPress={() => setOfferingForm((current) => ({ ...current, semesterId: semester.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Section" value={selectedOfferingSection?.label ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              <ActionButton size="small" variant={offeringForm.sectionId === '' ? 'primary' : 'ghost'} label="All sections" onPress={() => setOfferingForm((current) => ({ ...current, sectionId: '' }))} />
              {sections.map((section: any) => (
                <ActionButton key={section.id} size="small" variant={offeringForm.sectionId === section.id ? 'primary' : 'ghost'} label={section.label} onPress={() => setOfferingForm((current) => ({ ...current, sectionId: section.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Subject" value={selectedOfferingSubject ? `${selectedOfferingSubject.code} | ${selectedOfferingSubject.name}` : ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {subjects.map((subject: any) => (
                <ActionButton key={subject.id} size="small" variant={offeringForm.subjectId === subject.id ? 'primary' : 'ghost'} label={`${subject.code} ${subject.name}`} onPress={() => setOfferingForm((current) => ({ ...current, subjectId: subject.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Policy" value={selectedPolicy?.name ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              <ActionButton size="small" variant={offeringForm.internalMarksPolicyId === '' ? 'primary' : 'ghost'} label="No policy" onPress={() => setOfferingForm((current) => ({ ...current, internalMarksPolicyId: '' }))} />
              {policies.map((policy: any) => (
                <ActionButton key={policy.id} size="small" variant={offeringForm.internalMarksPolicyId === policy.id ? 'primary' : 'ghost'} label={policy.name} onPress={() => setOfferingForm((current) => ({ ...current, internalMarksPolicyId: policy.id }))} />
              ))}
            </ScrollView>
            <TextInput label="Total internal marks" value={offeringForm.totalInternalMarks} onChangeText={(value) => setOfferingForm((current) => ({ ...current, totalInternalMarks: value }))} mode="outlined" style={[{ marginTop: 12, backgroundColor: 'transparent' }]} />
            <View style={actionRowStyle}>
              <ActionButton
                variant="primary"
                icon={offeringForm.id ? 'content-save-outline' : 'plus-circle-outline'}
                label={offeringForm.id ? 'Update offering' : 'Create offering'}
                onPress={() => void handleOfferingSave()}
              />
            </View>
          </GlassCard>

          {offerings.map((offering: any) => (
            <GlassCard key={offering.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{offering.subjectName}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>{offering.departmentName} | {offering.semesterLabel} | Section {offering.sectionName ?? 'All'}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>{offering.subjectCode} | {offering.subjectType} | Internal {offering.totalInternalMarks}</Text>
              <View style={actionRowStyle}>
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteOffering(offering.id)} />
              </View>
            </GlassCard>
          ))}
        </>
      ) : null}

      {studio === 'assignments' ? (
        <>
          <SectionBlock title={assignmentForm.id ? 'Edit teacher assignment' : 'Create teacher assignment'} subtitle="Map a specific teacher to a particular class, section, and subject so attendance and marks screens know what to load.">
            <FormSection title="Assignment mapping">
              <GlassCard style={{ padding: 14, borderRadius: 22, backgroundColor: 'rgba(7, 17, 29, 0.6)' }}>
                <Text variant="labelLarge" style={{ color: '#8aa6c1' }}>Selected values</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 8 }}>Teacher: {selectedTeacher?.name ?? 'Not selected'}</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Class: {selectedClass?.name ?? 'Not selected'}</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Section: {selectedSection ? `${selectedSection.className} | ${selectedSection.label}` : 'Not selected'}</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Subject: {selectedSubject ? `${selectedSubject.code} | ${selectedSubject.name}` : 'Not selected'}</Text>
                <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Offering: {selectedOffering ? `${selectedOffering.subjectCode} | ${selectedOffering.sectionName ?? 'All sections'}` : 'Optional / not selected'}</Text>
              </GlassCard>

              <Text variant="titleSmall" style={{ color: '#f7fbff', marginTop: 14, fontWeight: '700' }}>Choose teacher</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                {teachers.map((teacher: any) => (
                  <ActionButton
                    key={teacher.id}
                    size="small"
                    variant={assignmentForm.teacherId === teacher.id ? 'primary' : 'ghost'}
                    label={teacher.name}
                    onPress={() => setAssignmentForm((current) => ({ ...current, teacherId: teacher.id }))}
                  />
                ))}
              </ScrollView>

              <Text variant="titleSmall" style={{ color: '#f7fbff', marginTop: 14, fontWeight: '700' }}>Choose class</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                {classes.map((item: any) => (
                  <ActionButton
                    key={item.id}
                    size="small"
                    variant={assignmentForm.classId === item.id ? 'primary' : 'ghost'}
                    label={item.name}
                    onPress={() => setAssignmentForm((current) => ({ ...current, classId: item.id, sectionId: '' }))}
                  />
                ))}
              </ScrollView>

              <Text variant="titleSmall" style={{ color: '#f7fbff', marginTop: 14, fontWeight: '700' }}>Choose section</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                {assignmentSections.map((section: any) => (
                    <ActionButton
                      key={section.id}
                      size="small"
                      variant={assignmentForm.sectionId === section.id ? 'primary' : 'ghost'}
                      label={`${section.className} ${section.label.split('Section ')[1] ?? section.label}`}
                      onPress={() => setAssignmentForm((current) => ({ ...current, sectionId: section.id }))}
                    />
                  ))}
              </ScrollView>

              <Text variant="titleSmall" style={{ color: '#f7fbff', marginTop: 14, fontWeight: '700' }}>Choose subject</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                {subjects.map((subject: any) => (
                  <ActionButton
                    key={subject.id}
                    size="small"
                    variant={assignmentForm.subjectId === subject.id ? 'primary' : 'ghost'}
                    label={`${subject.code} ${subject.name}`}
                    onPress={() => setAssignmentForm((current) => ({ ...current, subjectId: subject.id, subjectOfferingId: '' }))}
                  />
                ))}
              </ScrollView>

              <Text variant="titleSmall" style={{ color: '#f7fbff', marginTop: 14, fontWeight: '700' }}>Choose offering if available</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
                <ActionButton
                  size="small"
                  variant={assignmentForm.subjectOfferingId === '' ? 'primary' : 'ghost'}
                  label="No specific offering"
                  onPress={() => setAssignmentForm((current) => ({ ...current, subjectOfferingId: '' }))}
                />
                {relevantOfferings.map((offering: any) => (
                  <ActionButton
                    key={offering.id}
                    size="small"
                    variant={assignmentForm.subjectOfferingId === offering.id ? 'primary' : 'ghost'}
                    label={`${offering.subjectCode} | ${offering.sectionName ?? 'All sections'} | ${offering.semesterLabel}`}
                    onPress={() => setAssignmentForm((current) => ({ ...current, subjectOfferingId: offering.id }))}
                  />
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                <TextInput label="Teacher ID" value={assignmentForm.teacherId} editable={false} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
                <TextInput label="Class / Section" value={`${assignmentForm.classId ? 'Set' : ''}${assignmentForm.classId && assignmentForm.sectionId ? ' / ' : ''}${assignmentForm.sectionId ? 'Set' : ''}`} editable={false} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              </View>
              <TextInput label="Subject / Offering" value={`${assignmentForm.subjectId ? 'Set' : ''}${assignmentForm.subjectOfferingId ? ' / Set' : ''}`} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
              <ActionButton variant="primary" icon={assignmentForm.id ? 'content-save-outline' : 'plus-circle-outline'} label={assignmentForm.id ? 'Update assignment' : 'Create assignment'} onPress={() => void handleAssignmentSave()} style={{ marginTop: 14 }} />
            </FormSection>
          </SectionBlock>

          {existingAssignments.length ? (
            existingAssignments.map((assignment: any) => (
              <GlassCard key={assignment.id} style={{ marginBottom: 14 }}>
                <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{assignment.teacherName}</Text>
                <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>
                  {assignment.className} | Section {assignment.sectionName} | {assignment.subjectName}
                </Text>
                <View style={actionRowStyle}>
                  <ActionButton
                    variant="secondary"
                    icon="pencil-outline"
                    label="Reuse"
                    onPress={() =>
                      setAssignmentForm((current) => ({
                        ...current,
                        id: '',
                        classId: assignment.classId,
                        sectionId: assignment.sectionId,
                      }))
                    }
                  />
                  <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeleteAssignment(assignment.id)} />
                </View>
              </GlassCard>
            ))
          ) : (
            <EmptyState title="No teacher mappings yet" description="Create a teacher assignment here so the teacher can select that class and subject in attendance and marks." />
          )}
        </>
      ) : null}

      {studio === 'policies' ? (
        <>
          <GlassCard style={{ marginBottom: 16 }}>
            <Text variant="titleMedium" style={{ color: '#f7fbff', marginBottom: 12 }}>
              {policyForm.id ? 'Edit internal marks policy' : 'Create internal marks policy'}
            </Text>
            <TextInput label="Policy name" value={policyForm.name} onChangeText={(value) => setPolicyForm((current) => ({ ...current, name: value }))} mode="outlined" style={{ backgroundColor: 'transparent' }} />
            <TextInput label="Department ID" value={policyForm.departmentId} onChangeText={(value) => setPolicyForm((current) => ({ ...current, departmentId: value }))} mode="outlined" style={{ marginTop: 12, backgroundColor: 'transparent' }} />
            <TextInput label="Academic year ID" value={policyForm.academicYearId} onChangeText={(value) => setPolicyForm((current) => ({ ...current, academicYearId: value }))} mode="outlined" style={{ marginTop: 12, backgroundColor: 'transparent' }} />
            <TextInput label="Semester ID" value={policyForm.semesterId} onChangeText={(value) => setPolicyForm((current) => ({ ...current, semesterId: value }))} mode="outlined" style={{ marginTop: 12, backgroundColor: 'transparent' }} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Total marks" value={policyForm.totalMarks} onChangeText={(value) => setPolicyForm((current) => ({ ...current, totalMarks: value }))} mode="outlined" style={{ flex: 1, backgroundColor: 'transparent' }} />
              <TextInput label="Attendance threshold" value={policyForm.attendanceThreshold} onChangeText={(value) => setPolicyForm((current) => ({ ...current, attendanceThreshold: value }))} mode="outlined" style={{ flex: 1, backgroundColor: 'transparent' }} />
            </View>
            <TextInput label="Attendance bonus" value={policyForm.attendanceBonusMarks} onChangeText={(value) => setPolicyForm((current) => ({ ...current, attendanceBonusMarks: value }))} mode="outlined" style={{ marginTop: 12, backgroundColor: 'transparent' }} />
            <TextInput
              label="Components (CODE:Name:Marks per line)"
              value={policyForm.componentsText}
              onChangeText={(value) => setPolicyForm((current) => ({ ...current, componentsText: value }))}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={{ marginTop: 12, backgroundColor: 'transparent' }}
            />
            <View style={actionRowStyle}>
              <ActionButton
                variant="primary"
                icon={policyForm.id ? 'content-save-outline' : 'plus-circle-outline'}
                label={policyForm.id ? 'Update policy' : 'Create policy'}
                onPress={() => void handlePolicySave()}
              />
            </View>
          </GlassCard>

          {policies.map((policy: any) => (
            <GlassCard key={policy.id} style={{ marginBottom: 14 }}>
              <Text variant="titleMedium" style={{ color: '#f7fbff' }}>{policy.name}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>{policy.departmentName ?? 'All branches'} | {policy.semesterLabel ?? 'All semesters'} | Total {policy.totalMarks}</Text>
              <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>
                {policy.components.map((component: any) => `${component.code} ${component.maxMarks}`).join(' | ')}
              </Text>
              <View style={actionRowStyle}>
                <ActionButton
                  variant="secondary"
                  icon="pencil-outline"
                  label="Edit"
                  onPress={() =>
                    setPolicyForm({
                      id: policy.id,
                      name: policy.name,
                      departmentId: departments.find((department: any) => department.name === policy.departmentName)?.id ?? '',
                      academicYearId: academicYears.find((year: any) => year.name === policy.academicYearName)?.id ?? '',
                      semesterId: semesters.find((semester: any) => semester.label === policy.semesterLabel)?.id ?? '',
                      totalMarks: String(policy.totalMarks),
                      attendanceThreshold: String(policy.attendanceThreshold ?? 75),
                      attendanceBonusMarks: String(policy.attendanceBonusMarks ?? 0),
                      componentsText: policy.components.map((component: any) => `${component.code}:${component.name}:${component.maxMarks}`).join('\n'),
                    })
                  }
                />
                <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDeletePolicy(policy.id)} />
              </View>
            </GlassCard>
          ))}
        </>
      ) : null}

      <GlassCard style={{ marginTop: 12 }}>
        <Text variant="titleSmall" style={{ color: '#f7fbff', marginBottom: 10 }}>
          Quick references
        </Text>
        <Text style={{ color: '#8ba0bf' }}>
          Departments: {departments.map((item: any) => `${item.code}:${item.id.slice(0, 6)}`).join(' | ') || 'None'}
        </Text>
        <Text style={{ color: '#8ba0bf', marginTop: 6 }}>
          Academic years: {academicYears.map((item: any) => `${item.name}:${item.id.slice(0, 6)}`).join(' | ') || 'None'}
        </Text>
        <Text style={{ color: '#8ba0bf', marginTop: 6 }}>
          Semesters: {semesters.map((item: any) => `${item.label}:${item.id.slice(0, 6)}`).join(' | ') || 'None'}
        </Text>
        <Text style={{ color: '#8ba0bf', marginTop: 6 }}>
          Sections: {sections.map((item: any) => `${item.label}:${item.id.slice(0, 6)}`).join(' | ') || 'None'}
        </Text>
        <Text style={{ color: '#8ba0bf', marginTop: 6 }}>
          Subjects: {subjects.map((item: any) => `${item.code}:${item.id.slice(0, 6)}`).join(' | ') || 'None'}
        </Text>
      </GlassCard>
    </Screen>
  );
}
