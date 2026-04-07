import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import axios from 'axios';
import { HelperText, Searchbar, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { ActionButton } from '../../../src/components/ui/action-button';
import { EmptyState, FormSection, HeroBanner, InlineMetric, SectionBlock } from '../../../src/components/ui/enterprise';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { StatusPill } from '../../../src/components/ui/status-pill';
import { useAdminAcademicsOverview } from '../../../src/features/academics/use-academics';
import {
  useCreateStudent,
  useCreateTeacher,
  useDeleteStudent,
  useDeleteTeacher,
  useStudentsDirectory,
  useTeachersDirectory,
  useUpdateStudent,
  useUpdateTeacher,
} from '../../../src/features/people/use-directory';
import { useFeedback } from '../../../src/providers/feedback-provider';

const initialStudentForm = { id: '', firstName: '', lastName: '', email: '', mobileNumber: '', password: '', departmentId: '', admissionNo: '', rollNumber: '', usn: '', aadhaarNumber: '', course: '', currentYear: '', currentSemester: '', batchStartYear: '', sectionId: '', fatherName: '', motherName: '', parentPhone: '', address: '' };
const initialTeacherForm = { id: '', firstName: '', lastName: '', email: '', mobileNumber: '', password: '', employeeId: '', departmentId: '', aadhaarNumber: '', designation: '', qualification: '', specialization: '', address: '' };
const inputStyle = { backgroundColor: 'rgba(7, 17, 29, 0.68)' } as const;

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data ? error.response.data.message : null;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function getSuggestedSemesters(yearValue: string) {
  const year = Number(yearValue);
  return Number.isInteger(year) && year >= 1 && year <= 4 ? [`${year * 2 - 1}`, `${year * 2}`] : [];
}

export default function AdminPeopleScreen() {
  const [mode, setMode] = useState<'students' | 'teachers'>('students');
  const [search, setSearch] = useState('');
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [teacherForm, setTeacherForm] = useState(initialTeacherForm);
  const { showNotice, confirm } = useFeedback();
  const students = useStudentsDirectory(search);
  const teachers = useTeachersDirectory(search);
  const academics = useAdminAcademicsOverview();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const removeStudent = useDeleteStudent();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const removeTeacher = useDeleteTeacher();

  const departments = useMemo(() => (academics.data?.departments ?? []).map((department: any) => ({ id: department.id, code: department.code })), [academics.data?.departments]);
  const sections = useMemo(
    () =>
      (academics.data?.classes ?? []).flatMap((academicClass: any) =>
        academicClass.sections.map((section: any) => ({
          id: section.id,
          label: `${academicClass.name} ${section.name}${section.semesterNumber ? ` | Sem ${section.semesterNumber}` : ''}`,
          departmentId: section.departmentId,
          semesterNumber: section.semesterNumber,
        })),
      ),
    [academics.data?.classes],
  );
  const filteredSections = useMemo(
    () => sections.filter((section: any) => (!studentForm.departmentId || section.departmentId === studentForm.departmentId) && (!studentForm.currentSemester || String(section.semesterNumber ?? '') === studentForm.currentSemester)),
    [sections, studentForm.departmentId, studentForm.currentSemester],
  );
  const suggestedSemesters = useMemo(() => getSuggestedSemesters(studentForm.currentYear), [studentForm.currentYear]);
  const selectedStudentDepartment = departments.find((department: any) => department.id === studentForm.departmentId);
  const selectedStudentSection = filteredSections.find((section: any) => section.id === studentForm.sectionId);
  const selectedTeacherDepartment = departments.find((department: any) => department.id === teacherForm.departmentId);

  const saveStudent = async () => {
    const required = [studentForm.firstName, studentForm.lastName, studentForm.email, studentForm.mobileNumber, studentForm.departmentId, studentForm.sectionId, studentForm.admissionNo, studentForm.rollNumber, studentForm.usn, studentForm.currentYear, studentForm.currentSemester, studentForm.fatherName, studentForm.motherName, studentForm.parentPhone, studentForm.address];
    if (required.some((value) => !value.trim()) || (!studentForm.id && !studentForm.password.trim())) {
      showNotice({ title: 'Incomplete student profile', message: 'Fill the identity, academic, and parent fields before saving.', tone: 'error' });
      return;
    }
    const payload = { firstName: studentForm.firstName, lastName: studentForm.lastName, email: studentForm.email, mobileNumber: studentForm.mobileNumber, admissionNo: studentForm.admissionNo, rollNumber: studentForm.rollNumber, departmentId: studentForm.departmentId || undefined, usn: studentForm.usn, aadhaarNumber: studentForm.aadhaarNumber, course: studentForm.course, currentYear: studentForm.currentYear, currentSemester: studentForm.currentSemester, batchStartYear: studentForm.batchStartYear, sectionId: studentForm.sectionId, fatherName: studentForm.fatherName, motherName: studentForm.motherName, parentPhone: studentForm.parentPhone, address: studentForm.address, ...(studentForm.password ? { password: studentForm.password } : {}) };
    try {
      if (studentForm.id) await updateStudent.mutateAsync({ id: studentForm.id, ...payload });
      else await createStudent.mutateAsync(payload);
      showNotice({ title: studentForm.id ? 'Student updated' : 'Student added', message: 'The student record was saved successfully.', tone: 'success' });
      setStudentForm(initialStudentForm);
    } catch (error) {
      showNotice({ title: 'Unable to save student', message: getErrorMessage(error), tone: 'error' });
    }
  };

  const saveTeacher = async () => {
    const required = [teacherForm.firstName, teacherForm.lastName, teacherForm.email, teacherForm.mobileNumber, teacherForm.employeeId, teacherForm.departmentId];
    if (required.some((value) => !value.trim()) || (!teacherForm.id && !teacherForm.password.trim())) {
      showNotice({ title: 'Incomplete teacher profile', message: 'Add the faculty identity and department details before saving.', tone: 'error' });
      return;
    }
    const payload = { firstName: teacherForm.firstName, lastName: teacherForm.lastName, email: teacherForm.email, mobileNumber: teacherForm.mobileNumber, employeeId: teacherForm.employeeId, departmentId: teacherForm.departmentId || undefined, aadhaarNumber: teacherForm.aadhaarNumber, designation: teacherForm.designation, qualification: teacherForm.qualification, specialization: teacherForm.specialization, address: teacherForm.address, ...(teacherForm.password ? { password: teacherForm.password } : {}) };
    try {
      if (teacherForm.id) await updateTeacher.mutateAsync({ id: teacherForm.id, ...payload });
      else await createTeacher.mutateAsync(payload);
      showNotice({ title: teacherForm.id ? 'Teacher updated' : 'Teacher added', message: 'The faculty record is ready for academic workflows.', tone: 'success' });
      setTeacherForm(initialTeacherForm);
    } catch (error) {
      showNotice({ title: 'Unable to save teacher', message: getErrorMessage(error), tone: 'error' });
    }
  };

  const handleDelete = async (kind: 'student' | 'teacher', id: string, name: string) => {
    const shouldDelete = await confirm({ title: `Delete ${kind} record?`, message: `This will permanently remove ${name}.`, confirmLabel: `Delete ${kind}`, destructive: true });
    if (!shouldDelete) return;
    try {
      if (kind === 'student') await removeStudent.mutateAsync(id);
      else await removeTeacher.mutateAsync(id);
      showNotice({ title: `${kind === 'student' ? 'Student' : 'Teacher'} removed`, message: 'The record was deleted successfully.', tone: 'success' });
    } catch (error) {
      showNotice({ title: 'Delete failed', message: getErrorMessage(error), tone: 'error' });
    }
  };

  return (
    <Screen>
      <HeroBanner eyebrow="People" title="Run student and faculty management from a cleaner admin workspace." description="Identity, academic placement, parent details, and faculty profile data are now grouped into clearer mobile sections instead of one long CRUD stack." aside={<StatusPill label={mode === 'students' ? 'Students' : 'Teachers'} />} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><GlassCard><Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Students</Text><Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>{students.data?.items?.length ?? 0}</Text></GlassCard></View>
        <View style={{ flex: 1 }}><GlassCard><Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Teachers</Text><Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>{teachers.data?.length ?? 0}</Text></GlassCard></View>
      </View>

      <Searchbar placeholder="Search by name, email, USN, admission number, or employee ID" value={search} onChangeText={setSearch} style={{ marginTop: 16, marginBottom: 16, backgroundColor: 'rgba(10, 20, 33, 0.92)' }} inputStyle={{ color: '#f7fbff' }} />
      <SegmentedButtons value={mode} onValueChange={(value) => setMode(value as 'students' | 'teachers')} style={{ marginBottom: 16 }} buttons={[{ value: 'students', label: 'Students' }, { value: 'teachers', label: 'Teachers' }]} />

      {mode === 'students' ? (
        <SectionBlock title={studentForm.id ? 'Edit student profile' : 'Create student profile'} subtitle="Student forms are split into identity, academics, and family groups to reduce clutter.">
          <FormSection title="Identity">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput label="First name" value={studentForm.firstName} onChangeText={(value) => setStudentForm((current) => ({ ...current, firstName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Last name" value={studentForm.lastName} onChangeText={(value) => setStudentForm((current) => ({ ...current, lastName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Email" value={studentForm.email} onChangeText={(value) => setStudentForm((current) => ({ ...current, email: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Mobile" value={studentForm.mobileNumber} onChangeText={(value) => setStudentForm((current) => ({ ...current, mobileNumber: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <TextInput label={studentForm.id ? 'New password (optional)' : 'Temporary password'} value={studentForm.password} onChangeText={(value) => setStudentForm((current) => ({ ...current, password: value }))} secureTextEntry mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
          </FormSection>
          <FormSection title="Academic details">
            <GlassCard style={{ padding: 14, borderRadius: 22, backgroundColor: 'rgba(7, 17, 29, 0.6)', marginBottom: 12 }}>
              <Text variant="labelLarge" style={{ color: '#8aa6c1' }}>Selected academic mapping</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 8 }}>Department: {selectedStudentDepartment?.code ?? 'Not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Semester: {studentForm.currentSemester || 'Not selected'}</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 4 }}>Section: {selectedStudentSection?.label ?? 'Not selected'}</Text>
            </GlassCard>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput label="Admission no" value={studentForm.admissionNo} onChangeText={(value) => setStudentForm((current) => ({ ...current, admissionNo: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Roll no" value={studentForm.rollNumber} onChangeText={(value) => setStudentForm((current) => ({ ...current, rollNumber: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="USN" value={studentForm.usn} onChangeText={(value) => setStudentForm((current) => ({ ...current, usn: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Course" value={studentForm.course} onChangeText={(value) => setStudentForm((current) => ({ ...current, course: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Department" value={selectedStudentDepartment?.code ?? ''} editable={false} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Current year" value={studentForm.currentYear} onChangeText={(value) => setStudentForm((current) => ({ ...current, currentYear: value, currentSemester: current.currentSemester || getSuggestedSemesters(value)[0] || '' }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {departments.map((department: any) => <ActionButton key={department.id} size="small" variant={studentForm.departmentId === department.id ? 'primary' : 'ghost'} icon="domain" label={department.code} onPress={() => setStudentForm((current) => ({ ...current, departmentId: department.id }))} />)}
              {suggestedSemesters.map((semester) => <ActionButton key={semester} size="small" variant={studentForm.currentSemester === semester ? 'primary' : 'ghost'} icon="calendar-range" label={`Sem ${semester}`} onPress={() => setStudentForm((current) => ({ ...current, currentSemester: semester }))} />)}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Current semester" value={studentForm.currentSemester} onChangeText={(value) => setStudentForm((current) => ({ ...current, currentSemester: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Batch start year" value={studentForm.batchStartYear} onChangeText={(value) => setStudentForm((current) => ({ ...current, batchStartYear: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <TextInput label="Section" value={selectedStudentSection?.label ?? ''} editable={false} mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {filteredSections.map((section: any) => <ActionButton key={section.id} size="small" variant={studentForm.sectionId === section.id ? 'primary' : 'ghost'} icon="google-classroom" label={section.label} onPress={() => setStudentForm((current) => ({ ...current, sectionId: section.id }))} />)}
            </ScrollView>
          </FormSection>
          <FormSection title="Family and contact">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput label="Father name" value={studentForm.fatherName} onChangeText={(value) => setStudentForm((current) => ({ ...current, fatherName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Mother name" value={studentForm.motherName} onChangeText={(value) => setStudentForm((current) => ({ ...current, motherName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Parent phone" value={studentForm.parentPhone} onChangeText={(value) => setStudentForm((current) => ({ ...current, parentPhone: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Aadhaar" value={studentForm.aadhaarNumber} onChangeText={(value) => setStudentForm((current) => ({ ...current, aadhaarNumber: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <TextInput label="Address" value={studentForm.address} onChangeText={(value) => setStudentForm((current) => ({ ...current, address: value }))} mode="outlined" multiline numberOfLines={3} style={[{ marginTop: 12 }, inputStyle]} />
          </FormSection>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <ActionButton variant="primary" icon={studentForm.id ? 'content-save-outline' : 'account-plus-outline'} label={studentForm.id ? 'Update Student' : 'Create Student'} onPress={() => void saveStudent()} loading={createStudent.isPending || updateStudent.isPending} disabled={createStudent.isPending || updateStudent.isPending} />
            <ActionButton variant="secondary" icon="refresh" label="Clear" onPress={() => setStudentForm(initialStudentForm)} />
          </View>
          <HelperText type="info" visible>Student records capture identity, academic placement, and parent contact in one mobile-friendly form.</HelperText>
        </SectionBlock>
      ) : (
        <SectionBlock title={teacherForm.id ? 'Edit teacher profile' : 'Create teacher profile'} subtitle="Teacher forms now group faculty identity and department details more clearly.">
          <FormSection title="Identity">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput label="First name" value={teacherForm.firstName} onChangeText={(value) => setTeacherForm((current) => ({ ...current, firstName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Last name" value={teacherForm.lastName} onChangeText={(value) => setTeacherForm((current) => ({ ...current, lastName: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Email" value={teacherForm.email} onChangeText={(value) => setTeacherForm((current) => ({ ...current, email: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Mobile" value={teacherForm.mobileNumber} onChangeText={(value) => setTeacherForm((current) => ({ ...current, mobileNumber: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <TextInput label={teacherForm.id ? 'New password (optional)' : 'Temporary password'} value={teacherForm.password} onChangeText={(value) => setTeacherForm((current) => ({ ...current, password: value }))} secureTextEntry mode="outlined" style={[{ marginTop: 12 }, inputStyle]} />
          </FormSection>
          <FormSection title="Institutional details">
            <GlassCard style={{ padding: 14, borderRadius: 22, backgroundColor: 'rgba(7, 17, 29, 0.6)', marginBottom: 12 }}>
              <Text variant="labelLarge" style={{ color: '#8aa6c1' }}>Selected department</Text>
              <Text variant="bodyMedium" style={{ color: '#f7fbff', marginTop: 8 }}>{selectedTeacherDepartment?.code ?? 'Not selected'}</Text>
            </GlassCard>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput label="Employee ID" value={teacherForm.employeeId} onChangeText={(value) => setTeacherForm((current) => ({ ...current, employeeId: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Department" value={selectedTeacherDepartment?.code ?? ''} editable={false} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {departments.map((department: any) => <ActionButton key={department.id} size="small" variant={teacherForm.departmentId === department.id ? 'primary' : 'ghost'} icon="domain" label={department.code} onPress={() => setTeacherForm((current) => ({ ...current, departmentId: department.id }))} />)}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Designation" value={teacherForm.designation} onChangeText={(value) => setTeacherForm((current) => ({ ...current, designation: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Aadhaar" value={teacherForm.aadhaarNumber} onChangeText={(value) => setTeacherForm((current) => ({ ...current, aadhaarNumber: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <TextInput label="Qualification" value={teacherForm.qualification} onChangeText={(value) => setTeacherForm((current) => ({ ...current, qualification: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
              <TextInput label="Specialization" value={teacherForm.specialization} onChangeText={(value) => setTeacherForm((current) => ({ ...current, specialization: value }))} mode="outlined" style={[{ flex: 1 }, inputStyle]} />
            </View>
            <TextInput label="Address" value={teacherForm.address} onChangeText={(value) => setTeacherForm((current) => ({ ...current, address: value }))} mode="outlined" multiline numberOfLines={3} style={[{ marginTop: 12 }, inputStyle]} />
          </FormSection>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <ActionButton variant="primary" icon={teacherForm.id ? 'content-save-outline' : 'account-plus-outline'} label={teacherForm.id ? 'Update Teacher' : 'Create Teacher'} onPress={() => void saveTeacher()} loading={createTeacher.isPending || updateTeacher.isPending} disabled={createTeacher.isPending || updateTeacher.isPending} />
            <ActionButton variant="secondary" icon="refresh" label="Clear" onPress={() => setTeacherForm(initialTeacherForm)} />
          </View>
        </SectionBlock>
      )}

      <SectionBlock title={mode === 'students' ? 'Directory' : 'Faculty directory'} subtitle={mode === 'students' ? 'Student cards now emphasize USN, academic placement, and parent context.' : 'Teacher cards highlight department identity and class assignments.'}>
        {mode === 'students' ? (
          (students.data?.items ?? []).length ? (
            (students.data?.items ?? []).map((item: any) => (
              <GlassCard key={item.id} style={{ marginBottom: 14, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ color: '#f7fbff', fontWeight: '700' }}>{item.firstName} {item.lastName}</Text>
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>USN {item.usn ?? '--'} | Roll {item.rollNumber ?? '--'} | {item.section?.academicClass?.name ?? '--'} {item.section?.name ?? ''}</Text>
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>{item.department?.code ?? '--'} | Year {item.currentYear ?? '--'} | Sem {item.currentSemester ?? '--'}</Text>
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>Parents {item.fatherName ?? '--'} / {item.motherName ?? '--'} | {item.parentPhone ?? '--'}</Text>
                  </View>
                  <StatusPill label={item.department?.code ?? 'Student'} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <InlineMetric label="Course" value={item.course ?? '--'} />
                  <InlineMetric label="Admission" value={item.admissionNo ?? '--'} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                  <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setStudentForm({ id: item.id, firstName: item.firstName ?? '', lastName: item.lastName ?? '', email: item.user?.email ?? '', mobileNumber: item.user?.phone ?? '', password: '', departmentId: item.departmentId ?? '', admissionNo: item.admissionNo ?? '', rollNumber: item.rollNumber ?? '', usn: item.usn ?? '', aadhaarNumber: item.aadhaarNumber ?? '', course: item.course ?? '', currentYear: String(item.currentYear ?? ''), currentSemester: String(item.currentSemester ?? ''), batchStartYear: String(item.batchStartYear ?? ''), sectionId: item.sectionId ?? '', fatherName: item.fatherName ?? '', motherName: item.motherName ?? '', parentPhone: item.parentPhone ?? item.guardianPhone ?? '', address: item.address ?? '' })} />
                  <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDelete('student', item.id, `${item.firstName} ${item.lastName}`)} />
                </View>
              </GlassCard>
            ))
          ) : (
            <EmptyState title="No students found" description="Create a student profile or change the search to find a matching record." />
          )
        ) : (
          (teachers.data ?? []).length ? (
            (teachers.data ?? []).map((item: any) => (
              <GlassCard key={item.id} style={{ marginBottom: 14, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ color: '#f7fbff', fontWeight: '700' }}>{item.firstName} {item.lastName}</Text>
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 6 }}>{item.employeeId ?? '--'} | {item.user?.email ?? '--'} | {item.user?.phone ?? '--'}</Text>
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 4 }}>{item.department?.name ?? 'Department pending'} | {item.designation ?? 'Designation pending'}</Text>
                    <Text variant="bodySmall" style={{ color: '#8ba0bf', marginTop: 8 }}>Assignments: {(item.assignments ?? []).length ? (item.assignments ?? []).slice(0, 3).map((assignment: any) => `${assignment.subject.name} ${assignment.section.name}`).join(' | ') : 'No current assignments'}</Text>
                  </View>
                  <StatusPill label={item.department?.code ?? 'Teacher'} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <InlineMetric label="Qualification" value={item.qualification ?? '--'} />
                  <InlineMetric label="Specialization" value={item.specialization ?? '--'} />
                </View>
                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                  <ActionButton variant="secondary" icon="pencil-outline" label="Edit" onPress={() => setTeacherForm({ id: item.id, firstName: item.firstName ?? '', lastName: item.lastName ?? '', email: item.user?.email ?? '', mobileNumber: item.user?.phone ?? '', password: '', employeeId: item.employeeId ?? '', departmentId: item.departmentId ?? '', aadhaarNumber: item.aadhaarNumber ?? '', designation: item.designation ?? '', qualification: item.qualification ?? '', specialization: item.specialization ?? '', address: item.address ?? '' })} />
                  <ActionButton variant="danger" icon="trash-can-outline" label="Delete" onPress={() => void handleDelete('teacher', item.id, `${item.firstName} ${item.lastName}`)} />
                </View>
              </GlassCard>
            ))
          ) : (
            <EmptyState title="No teachers found" description="Create a teacher profile or adjust the search term to find one." />
          )
        )}
      </SectionBlock>
    </Screen>
  );
}
