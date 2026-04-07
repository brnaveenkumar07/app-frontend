import { Dimensions, ScrollView, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Text } from 'react-native-paper';
import { EmptyState, HeroBanner, InlineMetric, SectionBlock } from '../../../src/components/ui/enterprise';
import { GlassCard } from '../../../src/components/ui/glass-card';
import { Screen } from '../../../src/components/ui/screen';
import { StatusPill } from '../../../src/components/ui/status-pill';
import { useStudentPerformanceSummary } from '../../../src/features/performance/use-performance';

const chartWidth = Dimensions.get('window').width - 76;

export default function StudentPerformanceScreen() {
  const { data } = useStudentPerformanceSummary();
  const subjectTrend = (data?.subjectBreakdown ?? []).filter((subject: any) => Number.isFinite(subject?.percentage));
  const canRenderTrendChart = subjectTrend.length >= 2;
  const overallAverage = Number(data?.summary?.overallPercentage ?? 0);
  const remaining = Math.max(100 - overallAverage, 0);

  return (
    <Screen>
      <HeroBanner
        eyebrow="Performance"
        title="Track internal performance with clearer academic insight."
        description="Review subject trends, internal totals, semester outcomes, and teacher observations in a cleaner student-first layout."
        aside={<StatusPill label={overallAverage >= 75 ? 'On Track' : 'Attention'} />}
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Overall average</Text>
            <Text variant="headlineSmall" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>
              {data?.summary?.overallPercentage ?? '--'}%
            </Text>
            <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
              Across {data?.summary?.totalAssessments ?? 0} assessments
            </Text>
          </GlassCard>
        </View>
        <View style={{ flex: 1 }}>
          <GlassCard>
            <Text variant="labelMedium" style={{ color: '#8aa6c1' }}>Academic context</Text>
            <Text variant="titleMedium" style={{ color: '#f7fbff', marginTop: 6, fontWeight: '700' }}>
              Sem {data?.student?.currentSemester ?? '--'}
            </Text>
            <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
              USN {data?.student?.usn ?? '--'}
            </Text>
          </GlassCard>
        </View>
      </View>

      <SectionBlock title="Performance snapshot" subtitle="A quick view of overall standing before you go into subject-level detail.">
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <InlineMetric label="Department" value={data?.student?.departmentName ?? 'Department'} />
          <InlineMetric label="Assessments" value={String(data?.summary?.totalAssessments ?? 0)} />
          <InlineMetric label="Trend subjects" value={String(subjectTrend.length)} tone="positive" />
        </View>
        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <PieChart
            data={[
              {
                name: 'Scored',
                population: overallAverage || 0.01,
                color: '#7dd3fc',
                legendFontColor: '#d9e7f3',
                legendFontSize: 12,
              },
              {
                name: 'Remaining',
                population: remaining || 0.01,
                color: '#1e364e',
                legendFontColor: '#8ba2bb',
                legendFontSize: 12,
              },
            ]}
            width={chartWidth}
            height={180}
            chartConfig={{ color: () => '#ffffff' }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            hasLegend
            absolute
          />
        </View>
      </SectionBlock>

      <SectionBlock title="Subject trend" subtitle="See where your stronger and weaker academic areas are developing.">
        {canRenderTrendChart ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: subjectTrend.map((subject: any) => subject.subjectName.slice(0, 4)),
                datasets: [{ data: subjectTrend.map((subject: any) => Number(subject.percentage)) }],
              }}
              width={chartWidth}
              height={230}
              yAxisSuffix="%"
              chartConfig={{
                backgroundGradientFrom: '#091422',
                backgroundGradientTo: '#091422',
                decimalPlaces: 0,
                color: () => '#7dd3fc',
                labelColor: () => '#8ba2bb',
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#34d399' },
              }}
              bezier
              style={{ borderRadius: 18 }}
            />
          </ScrollView>
        ) : subjectTrend.length === 1 ? (
          <GlassCard style={{ backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
            <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
              {subjectTrend[0].subjectName}
            </Text>
            <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 6 }}>
              {subjectTrend[0].percentage}% across {subjectTrend[0].assessments} assessment{subjectTrend[0].assessments === 1 ? '' : 's'}.
            </Text>
          </GlassCard>
        ) : (
          <EmptyState title="No trend data yet" description="Trend visualisation will appear as soon as marks are available across multiple subjects." />
        )}
      </SectionBlock>

      <SectionBlock title="Internal marks summary" subtitle="Semester-wise internal totals grouped into clearer subject cards.">
        {data?.finalInternalMarks?.length ? (
          data.finalInternalMarks.map((item: any) => (
            <GlassCard key={item.id} style={{ marginBottom: 12, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
              <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                {item.subjectName}
              </Text>
              <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
                {item.semesterLabel} | {item.totalMarks}/{item.outOfMarks}
              </Text>
              <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 4 }}>
                {item.remark ?? 'No remark added'}
              </Text>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="No internal totals yet" description="Final internal calculations will appear here after faculty upload and publish the marks." />
        )}
      </SectionBlock>

      <SectionBlock title="Recent marks" subtitle="The latest evaluated components and their score breakdown.">
        {data?.recentMarks?.length ? (
          data.recentMarks.map((mark: any) => (
            <GlassCard key={mark.id} style={{ marginBottom: 12, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
              <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                {mark.title}
              </Text>
              <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
                {mark.subjectName} | {mark.componentName ?? mark.type}
              </Text>
              <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 4 }}>
                {mark.marksObtained}/{mark.maxMarks} | Grade {mark.grade ?? '--'}
              </Text>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="No recent marks available" description="Newly evaluated quizzes, assignments, and exams will appear here." />
        )}
      </SectionBlock>

      <SectionBlock title="Semester results" subtitle="Published result lines are shown with cleaner semester and grade context.">
        {data?.semesterResults?.length ? (
          data.semesterResults.map((result: any) => (
            <GlassCard key={result.id} style={{ marginBottom: 12, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                    {result.subjectName}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#90a9c2', marginTop: 6 }}>
                    {result.semesterLabel} | {result.marksObtained}/{result.maxMarks} | Grade {result.grade ?? '--'}
                  </Text>
                </View>
                <StatusPill label={result.resultStatus} />
              </View>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="No semester results yet" description="Official semester results will show up here once they are available." />
        )}
      </SectionBlock>

      <SectionBlock title="Teacher remarks" subtitle="Faculty guidance is grouped separately so it does not get lost in the score data.">
        {data?.remarks?.length ? (
          data.remarks.map((remark: any) => (
            <GlassCard key={remark.id} style={{ marginBottom: 12, backgroundColor: 'rgba(7, 17, 29, 0.58)' }}>
              <Text variant="titleSmall" style={{ color: '#f7fbff', fontWeight: '700' }}>
                {remark.teacherName}
              </Text>
              <Text variant="bodyMedium" style={{ color: '#90a9c2', marginTop: 6, lineHeight: 20 }}>
                {remark.content}
              </Text>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="No remarks yet" description="Teacher feedback will be surfaced here once faculty start adding remarks to your profile." />
        )}
      </SectionBlock>
    </Screen>
  );
}
